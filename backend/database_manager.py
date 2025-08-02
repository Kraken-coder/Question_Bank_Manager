import psycopg2 
import psycopg2.extras
from schemas import Stats
from config import DB_CONFIG

class DatabaseManager:
    def __init__(self, dbname=None, user=None, password=None, host=None, port=None):
        # Use provided parameters or fall back to config
        self.connection = psycopg2.connect(
            dbname=dbname or DB_CONFIG['dbname'],
            user=user or DB_CONFIG['user'],
            password=password or DB_CONFIG['password'],
            host=host or DB_CONFIG['host'],
            port=port or DB_CONFIG['port']
        )
        self.cursor = self.connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
    def insert_question(self, question_data):
        insert_query = """
        INSERT INTO questions (question, difficulty, language, image_required, type, solution)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING question_id;
        """
        try :
            self.cursor.execute(insert_query, (
            question_data['question'],
            question_data['difficulty'],
            question_data.get('language', 'English'),
            question_data.get('image_required', False),
            question_data['question_type'],
            question_data['solution']
        ))
            question_id = self.cursor.fetchone()[0]
            self.connection.commit()
            tags = question_data.get('tags', [])
            if tags:
                self.insert_tags(question_id, tags)
        except Exception as e:
            print(f"Error inserting question: {e}")
            self.connection.rollback()
            raise e
        return question_id

    def get_question(self, question_id):
        question_query = "SELECT * FROM questions WHERE question_id = %s;"
        self.cursor.execute(question_query, (question_id,))
        question = self.cursor.fetchone()
        if not question:
            return None
        tags_query = "SELECT tag FROM tags WHERE question_id = %s;"
        self.cursor.execute(tags_query, (question_id,))
        tags = [row['tag'] for row in self.cursor.fetchall()]
        question_dict = dict(question)
        question_dict['tags'] = tags
        return question_dict
    def get_questions(self, question_ids):
        """
        Get multiple questions by their IDs.
        
        Args:
            question_ids: List of question IDs to retrieve
            
        Returns:
            Dictionary containing list of question dictionaries
        """
        if not question_ids:
            return {"questions": []}
        
        try:
            # Use a single query with IN clause for better performance
            placeholders = ','.join(['%s'] * len(question_ids))
            query = f"""
            SELECT q.question_id, q.question, q.difficulty, q.language, 
                   q.image_required, q.type, q.solution,
                   STRING_AGG(DISTINCT t.tag, ',') as tags
            FROM questions q
            LEFT JOIN tags t ON q.question_id = t.question_id
            WHERE q.question_id IN ({placeholders})
            GROUP BY q.question_id, q.question, q.difficulty, q.language, q.image_required, q.type, q.solution
            ORDER BY q.question_id DESC
            """
            
            self.cursor.execute(query, question_ids)
            
            questions_data = []
            for row in self.cursor.fetchall():
                question_dict = dict(row)
                # Handle tags - convert comma-separated string to list
                tags_string = question_dict.get('tags', '')
                if tags_string and tags_string.strip():
                    question_dict['tags'] = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
                else:
                    question_dict['tags'] = []
                questions_data.append(question_dict)
            
            return {"questions": questions_data}
            
        except psycopg2.Error as e:
            print(f"Error fetching questions: {e}")
            self.connection.rollback()
            return {"questions": []}

    def update_question(self, question_id, update_data):
        tags = update_data.pop('tags', None)
        
        if update_data:
            # Map frontend field names to database field names
            field_mapping = {
                'question_type': 'type'
            }
            
            # Build the SET clause with proper field mapping
            set_parts = []
            values = []
            
            for key, value in update_data.items():
                # Map the field name if needed
                db_field = field_mapping.get(key, key)
                set_parts.append(f"{db_field} = %s")
                values.append(value)
            
            set_clause = ', '.join(set_parts)
            values.append(question_id)  # Add question_id for WHERE clause
            
            query = f"UPDATE questions SET {set_clause} WHERE question_id = %s;"
            self.cursor.execute(query, values)
            self.connection.commit()
        
        if tags is not None:
            self.cursor.execute("DELETE FROM tags WHERE question_id = %s;", (question_id,))
            self.connection.commit()
            if tags:
                self.insert_tags(question_id, tags)

    def delete_question(self, question_id):
        self.cursor.execute(f"DELETE FROM tags WHERE question_id ={question_id} ")
        self.connection.commit()
        self.cursor.execute("DELETE FROM questions WHERE question_id = %s;", (question_id,))
        self.connection.commit()
        

    def insert_tag(self, question_id, tag):
        query = "INSERT INTO tags (question_id, tag) VALUES (%s, %s);"
        self.cursor.execute(query, (question_id, tag))
        self.connection.commit()

    def get_tags(self, question_id):
        query = "SELECT * FROM tags WHERE question_id = %s;"
        self.cursor.execute(query, (question_id,))
        return self.cursor.fetchall()

    def update_tag(self, tag_id, new_tag):
        query = "UPDATE tags SET tag = %s WHERE id = %s;"
        self.cursor.execute(query, (new_tag, tag_id))
        self.connection.commit()

    def delete_tag(self, tag_id):
        query = "DELETE FROM tags WHERE id = %s;"
        self.cursor.execute(query, (tag_id,))
        self.connection.commit()
    def insert_tags(self, question_id, tags):
        if not tags:
            return
        query = """ INSERT INTO tags (question_id, tag) VALUES %s; """
        # Prepare a list of tuples for execution
        values = [(question_id, tag) for tag in tags]
        psycopg2.extras.execute_values(self.cursor, query, values)
        self.connection.commit()

    def search_questions(self, search_query, limit=10):
        """
        Search questions in the database using text matching.
        Searches in question text, solution, and tags.
        """
        search_pattern = f"%{search_query}%"
        
        query = """
        SELECT q.question_id, q.question, q.difficulty, q.language, 
               q.image_required, q.type, q.solution,
               STRING_AGG(DISTINCT t.tag, ',') as tags,
               CASE 
                   WHEN q.question ILIKE %s THEN 1
                   WHEN q.solution ILIKE %s THEN 2
                   WHEN EXISTS (SELECT 1 FROM tags t2 WHERE t2.question_id = q.question_id AND t2.tag ILIKE %s) THEN 3
                   ELSE 4
               END as match_priority
        FROM questions q
        LEFT JOIN tags t ON q.question_id = t.question_id
        WHERE 
            q.question ILIKE %s OR 
            q.solution ILIKE %s OR 
            q.difficulty ILIKE %s OR 
            q.type ILIKE %s OR
            EXISTS (SELECT 1 FROM tags t3 WHERE t3.question_id = q.question_id AND t3.tag ILIKE %s)
        GROUP BY q.question_id, q.question, q.difficulty, q.language, q.image_required, q.type, q.solution
        ORDER BY match_priority
        LIMIT %s;
        """
        
        try:
            self.cursor.execute(query, (
            search_pattern, search_pattern, search_pattern,
            search_pattern, search_pattern, search_pattern, search_pattern, search_pattern, limit
        ))
        except psycopg2.Error as e:
            print(f"Error executing search query: {e}")
            self.connection.rollback()
            return []

        results = []
        for row in self.cursor.fetchall():
            question_dict = dict(row)
            # Handle tags - convert comma-separated string to list
            tags_string = question_dict.get('tags', '')
            if tags_string and tags_string.strip():
                question_dict['tags'] = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
            else:
                question_dict['tags'] = []
            results.append(question_dict)
        
        return results

    def get_all_questions(self, limit=None, offset=0):
        """
        Get all questions from the database with their tags.
        
        Args:
            limit: Maximum number of questions to return (None for all)
            offset: Number of questions to skip (for pagination)
        
        Returns:
            List of question dictionaries with tags
        """
        try:
            # Build the query with optional limit and offset
            query = """
            SELECT q.question_id, q.question, q.difficulty, q.language, 
                   q.image_required, q.type, q.solution,
                   STRING_AGG(DISTINCT t.tag, ',') as tags
            FROM questions q
            LEFT JOIN tags t ON q.question_id = t.question_id
            GROUP BY q.question_id, q.question, q.difficulty, q.language, q.image_required, q.type, q.solution
            ORDER BY q.question_id DESC
            """
            
            params = []
            if limit is not None:
                query += " LIMIT %s"
                params.append(limit)
            if offset > 0:
                query += " OFFSET %s"
                params.append(offset)
            
            self.cursor.execute(query, tuple(params))
            
            results = []
            for row in self.cursor.fetchall():
                question_dict = dict(row)
                # Handle tags - convert comma-separated string to list
                tags_string = question_dict.get('tags', '')
                if tags_string and tags_string.strip():
                    question_dict['tags'] = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
                else:
                    question_dict['tags'] = []
                results.append(question_dict)
            
            return results
            
        except psycopg2.Error as e:
            print(f"Error fetching all questions: {e}")
            self.connection.rollback()
            return []

    def filter_questions(self, tags=None, difficulty=None, language=None, question_type=None, limit=None, offset=0):
        """
        Filter questions based on various criteria.
        
        Args:
            tags: List of tags to filter by (questions with ANY of these tags)
            difficulty: Difficulty level to filter by
            language: Language to filter by
            question_type: Question type to filter by
            limit: Maximum number of questions to return
            offset: Number of questions to skip (for pagination)
        
        Returns:
            List of filtered question dictionaries with tags
        """
        try:
            # Build the WHERE clause dynamically
            where_conditions = []
            params = []
            
            if difficulty:
                where_conditions.append("q.difficulty ILIKE %s")
                params.append(f"%{difficulty}%")
            
            if language:
                where_conditions.append("q.language ILIKE %s")
                params.append(f"%{language}%")
            
            if question_type:
                where_conditions.append("q.type ILIKE %s")
                params.append(f"%{question_type}%")
            
            if tags and len(tags) > 0:
                # Create placeholders for tags
                tag_placeholders = ','.join(['%s'] * len(tags))
                where_conditions.append(f"EXISTS (SELECT 1 FROM tags t2 WHERE t2.question_id = q.question_id AND t2.tag IN ({tag_placeholders}))")
                params.extend(tags)
            
            # Base query
            query = """
            SELECT q.question_id, q.question, q.difficulty, q.language, 
                   q.image_required, q.type, q.solution,
                   STRING_AGG(DISTINCT t.tag, ',') as tags
            FROM questions q
            LEFT JOIN tags t ON q.question_id = t.question_id
            """
            
            # Add WHERE clause if we have conditions
            if where_conditions:
                query += " WHERE " + " AND ".join(where_conditions)
            
            # Add GROUP BY and ORDER BY
            query += """
            GROUP BY q.question_id, q.question, q.difficulty, q.language, q.image_required, q.type, q.solution
            ORDER BY q.question_id DESC
            """
            
            # Add LIMIT and OFFSET
            if limit is not None:
                query += " LIMIT %s"
                params.append(limit)
            if offset > 0:
                query += " OFFSET %s"
                params.append(offset)
            
            self.cursor.execute(query, tuple(params))
            
            results = []
            for row in self.cursor.fetchall():
                question_dict = dict(row)
                # Handle tags - convert comma-separated string to list
                tags_string = question_dict.get('tags', '')
                if tags_string and tags_string.strip():
                    question_dict['tags'] = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
                else:
                    question_dict['tags'] = []
                results.append(question_dict)
            
            return results
            
        except psycopg2.Error as e:
            print(f"Error filtering questions: {e}")
            self.connection.rollback()
            return []

    def get_unique_values(self, field):
        """
        Get unique values for a specific field (difficulty, language, type).
        
        Args:
            field: The field name ('difficulty', 'language', 'type')
        
        Returns:
            List of unique values for the specified field
        """
        try:
            if field not in ['difficulty', 'language', 'type']:
                raise ValueError("Field must be one of: difficulty, language, type")
            
            query = f"SELECT DISTINCT {field} FROM questions WHERE {field} IS NOT NULL AND {field} != '' ORDER BY {field};"
            self.cursor.execute(query)
            
            results = [row[0] for row in self.cursor.fetchall()]
            return results
            
        except (psycopg2.Error, ValueError) as e:
            print(f"Error getting unique values for {field}: {e}")
            return []
    def get_stats(self):
        """
        Get comprehensive statistics about the question database.
        
        Returns:
            Dictionary containing counts by difficulty, question type, and all topics
        """
        try:
            stats = {}
            
            # Get difficulty statistics
            difficulties = ["Easy", "Medium", "Hard"]
            for difficulty in difficulties:
                query = "SELECT COUNT(*) FROM questions WHERE difficulty ILIKE %s"
                self.cursor.execute(query, (difficulty,))
                count = self.cursor.fetchone()[0]
                stats[difficulty] = count
            
            # Get question type statistics
            type_mapping = {
                "MCQ": "MCQ",
                "Short Answer": "Short_answer", 
                "Long Answer": "Long_answer",
                "oneword": "oneword",
                "True/False": "Tf"
            }
            
            for db_type, schema_key in type_mapping.items():
                query = "SELECT COUNT(*) FROM questions WHERE type ILIKE %s"
                self.cursor.execute(query, (db_type,))
                count = self.cursor.fetchone()[0]
                stats[schema_key] = count
            
            # Get all unique topics/tags
            query = "SELECT DISTINCT tag FROM tags WHERE tag IS NOT NULL AND tag != '' ORDER BY tag"
            self.cursor.execute(query)
            topics = [row[0] for row in self.cursor.fetchall()]
            stats['topics'] = topics
            
            # Get total questions count
            query = "SELECT COUNT(*) FROM questions"
            self.cursor.execute(query)
            stats['total_questions'] = self.cursor.fetchone()[0]
            
            # Get language statistics
            query = "SELECT language, COUNT(*) FROM questions WHERE language IS NOT NULL GROUP BY language ORDER BY COUNT(*) DESC"
            self.cursor.execute(query)
            language_stats = {}
            for row in self.cursor.fetchall():
                language_stats[row[0]] = row[1]
            stats['languages'] = language_stats
            
            # Get tag statistics (most popular tags)
            query = """
            SELECT tag, COUNT(*) as count 
            FROM tags 
            WHERE tag IS NOT NULL AND tag != '' 
            GROUP BY tag 
            ORDER BY count DESC 
            LIMIT 10
            """
            self.cursor.execute(query)
            tag_stats = {}
            for row in self.cursor.fetchall():
                tag_stats[row[0]] = row[1]
            stats['popular_tags'] = tag_stats
            
            return stats
            
        except psycopg2.Error as e:
            print(f"Error getting statistics: {e}")
            return {}
    def get_all_tags(self):
        """
        Get all unique tags from the database.
        
        Returns:
            List of unique tags
        """
        try:
            query = "SELECT DISTINCT tag FROM tags WHERE tag IS NOT NULL AND tag != '' ORDER BY tag;"
            self.cursor.execute(query)
            
            results = [row[0] for row in self.cursor.fetchall()]
            return results
            
        except psycopg2.Error as e:
            print(f"Error getting all tags: {e}")
            return []

    def close(self):
        self.cursor.close()
        self.connection.close()
if __name__ == "__main__":
    db_manager = DatabaseManager()
    print(db_manager.get_questions([19 , 18 , 17]))
    # Example usage
    # question_data = {
    #     'question': 'What is the capital of France?',
    #     'difficulty': 'easy',
    #     'language': 'English',
    #     'image_required': False,
    #     'question_type': 'multiple_choice',
    #     'solution': 'Paris',
    #     'tags': ['geography', 'europe', 'capitals']
    # }
    # question_id = db_manager.insert_question(question_data)
    # print(f"Inserted question with ID: {question_id}")
    # # question_id = 2
    # # Fetch the question
    # question = db_manager.get_question(question_id)
    # print("Fetched question:", question)

    # # Fetch and print tags for the question
    # tags = db_manager.get_tags(question_id)
    # print("Fetched tags:", tags)

    # db_manager.update_question(question_id, {'difficulty': 'medium'})
    # print("Updated question difficulty.")

    # # # Delete the question
    # # db_manager.delete_question(question_id)
    # print("Deleted question.")

    db_manager.close()