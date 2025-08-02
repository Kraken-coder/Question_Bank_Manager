import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Tags, Globe } from 'lucide-react';
import { questionService } from '../services/questionService';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionService.getStatistics();
      if (response.success) {
        setStats(response.statistics);
      } else {
        setError(response.error || 'Failed to load statistics');
      }
    } catch (err) {
      setError('Failed to load statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (value, total, color = '#007bff') => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          width: '100%',
          height: '20px',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
          {value} ({percentage.toFixed(1)}%)
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color = '#007bff', subtitle }) => (
    <div style={{
      padding: '20px',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ color, marginBottom: '10px' }}>
        {icon}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#dc3545', marginBottom: '10px' }}>Error loading statistics</div>
        <div style={{ color: '#666', marginBottom: '20px' }}>{error}</div>
        <button 
          className="btn btn-primary" 
          onClick={loadStatistics}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        No statistics available
      </div>
    );
  }

  const totalQuestions = stats.total_questions || 0;
  const difficultyTotal = (stats.Easy || 0) + (stats.Medium || 0) + (stats.Hard || 0);
  const typeTotal = (stats.MCQ || 0) + (stats.Short_answer || 0) + (stats.Long_answer || 0) + (stats.oneword || 0) + (stats.Tf || 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '10px' }}>Database Statistics</h2>
        <button 
          className="btn btn-primary" 
          onClick={loadStatistics}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Statistics'}
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          icon={<BarChart3 size={32} />}
          color="#28a745"
        />
        <StatCard
          title="Total Topics"
          value={stats.topics?.length || 0}
          icon={<Tags size={32} />}
          color="#17a2b8"
        />
        <StatCard
          title="Languages"
          value={Object.keys(stats.languages || {}).length}
          icon={<Globe size={32} />}
          color="#ffc107"
        />
        <StatCard
          title="Popular Tags"
          value={Object.keys(stats.popular_tags || {}).length}
          icon={<TrendingUp size={32} />}
          color="#6f42c1"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        
        {/* Difficulty Distribution */}
        <div style={{
          padding: '20px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChart size={24} color="#007bff" />
            Difficulty Distribution
          </h3>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>Easy</span>
              <strong>{stats.Easy || 0}</strong>
            </div>
            {renderProgressBar(stats.Easy || 0, difficultyTotal, '#28a745')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>Medium</span>
              <strong>{stats.Medium || 0}</strong>
            </div>
            {renderProgressBar(stats.Medium || 0, difficultyTotal, '#ffc107')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>Hard</span>
              <strong>{stats.Hard || 0}</strong>
            </div>
            {renderProgressBar(stats.Hard || 0, difficultyTotal, '#dc3545')}
          </div>
        </div>

        {/* Question Type Distribution */}
        <div style={{
          padding: '20px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="#17a2b8" />
            Question Type Distribution
          </h3>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>MCQ</span>
              <strong>{stats.MCQ || 0}</strong>
            </div>
            {renderProgressBar(stats.MCQ || 0, typeTotal, '#007bff')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>Short Answer</span>
              <strong>{stats.Short_answer || 0}</strong>
            </div>
            {renderProgressBar(stats.Short_answer || 0, typeTotal, '#28a745')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>Long Answer</span>
              <strong>{stats.Long_answer || 0}</strong>
            </div>
            {renderProgressBar(stats.Long_answer || 0, typeTotal, '#ffc107')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>One Word</span>
              <strong>{stats.oneword || 0}</strong>
            </div>
            {renderProgressBar(stats.oneword || 0, typeTotal, '#17a2b8')}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span>True/False</span>
              <strong>{stats.Tf || 0}</strong>
            </div>
            {renderProgressBar(stats.Tf || 0, typeTotal, '#6f42c1')}
          </div>
        </div>

        {/* Language Distribution */}
        {stats.languages && Object.keys(stats.languages).length > 0 && (
          <div style={{
            padding: '20px',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={24} color="#ffc107" />
              Language Distribution
            </h3>
            <div>
              {Object.entries(stats.languages).map(([language, count], index) => {
                const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
                const color = colors[index % colors.length];
                return (
                  <div key={language}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span>{language}</span>
                      <strong>{count}</strong>
                    </div>
                    {renderProgressBar(count, totalQuestions, color)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {stats.popular_tags && Object.keys(stats.popular_tags).length > 0 && (
          <div style={{
            padding: '20px',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} color="#6f42c1" />
              Popular Tags (Top 10)
            </h3>
            <div>
              {Object.entries(stats.popular_tags).map(([tag, count], index) => {
                const colors = ['#6f42c1', '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
                const color = colors[index % colors.length];
                return (
                  <div key={tag}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <span>{tag}</span>
                      <strong>{count}</strong>
                    </div>
                    {renderProgressBar(count, totalQuestions, color)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Topics */}
        {stats.topics && stats.topics.length > 0 && (
          <div style={{
            padding: '20px',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            backgroundColor: 'white',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Tags size={24} color="#17a2b8" />
              All Topics ({stats.topics.length})
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px'
            }}>
              {stats.topics.map((topic, index) => (
                <span
                  key={topic}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
