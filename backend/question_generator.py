from config import GOOGLE_API_KEY
from google import genai
from schemas import QuestionForGeneration

class QuestionGenerator:
    def __init__(self):
        self.client = genai.Client(api_key=GOOGLE_API_KEY)
    def __prompt(self, table_specification):
        return f"Generate a question based on the following table of specifications: {table_specification} if the question type is MCQ then make sure that the options are in the question and the answer is in the solution field. If the question type is short answer then make sure that the answer is in the solution field. If the question type is long answer then make sure that the answer is in the solution field. If the question type is oneword then make sure that the answer is in the solution field. If the question type is True/False then make sure that the answer is in the solution field. Set language to 'English' and image_required to false unless specified otherwise."
    def generate_questions(self, table_specification):
        generated_output = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=self.__prompt(table_specification=table_specification),
            config= {
                "response_mime_type": "application/json",
                "response_schema": list[QuestionForGeneration],
            }
        )
        return generated_output.text
if __name__ == "__main__":
    table_spec = {
        "question_type": "MCQ",
        "difficulty": "Easy",
        "tags": ["math", "algebra"],
        "language": "English",
        "image_required": False
    }
    question_generator = QuestionGenerator()
    questions = question_generator.generate_questions(table_specification=table_spec)
    print(questions)