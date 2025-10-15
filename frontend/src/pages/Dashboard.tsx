import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../contexts/TaskContext';
import AppLayout from '../components/AppLayout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, refreshStats } = useTask();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Recarregar estatísticas quando o componente ganhar foco
  useEffect(() => {
    const handleFocus = () => {
      refreshStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshStats]);

  return (
    <AppLayout>
      <div style={{ padding: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total de Tarefas"
                value={stats.totalTasks}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Concluídas"
                value={stats.completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pendentes"
                value={stats.pendingTasks}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/tasks')}
                style={{ width: '100%' }}
              >
                Nova Tarefa
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
};

export default Dashboard;