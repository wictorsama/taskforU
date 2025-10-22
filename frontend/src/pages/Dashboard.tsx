import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../contexts/TaskContext';
import AppLayout from '../components/AppLayout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading, refreshStats } = useTask();
  const [isMobile, setIsMobile] = useState(false);

  // Verificar se é mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      <div style={{ padding: isMobile ? '12px' : '24px' }}>
        <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                height: '100%',
                minHeight: isMobile ? '120px' : '140px'
              }}
            >
              <Statistic
                title="Total de Tarefas"
                value={stats.totalTasks}
                prefix={<FileTextOutlined />}
                loading={loading}
                valueStyle={{ 
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                height: '100%',
                minHeight: isMobile ? '120px' : '140px'
              }}
            >
              <Statistic
                title="Concluídas"
                value={stats.completedTasks}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ 
                  color: '#3f8600',
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 'bold'
                }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                height: '100%',
                minHeight: isMobile ? '120px' : '140px'
              }}
            >
              <Statistic
                title="Pendentes"
                value={stats.pendingTasks}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ 
                  color: '#faad14',
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 'bold'
                }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                height: '100%',
                minHeight: isMobile ? '120px' : '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              styles={{
                body: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: isMobile ? '12px' : '24px'
                }
              }}
            >
              <Button
                type="primary"
                size={isMobile ? 'middle' : 'large'}
                icon={<PlusOutlined />}
                onClick={() => navigate('/tasks')}
                style={{ 
                  width: '100%',
                  height: isMobile ? '40px' : '48px',
                  fontSize: isMobile ? '14px' : '16px'
                }}
              >
                {isMobile ? 'Nova Tarefa' : 'Nova Tarefa'}
              </Button>
            </Card>
          </Col>
        </Row>
        
        {/* Seção adicional para mobile com informações úteis */}
        {isMobile && (
          <Card 
            title="Resumo Rápido" 
            style={{ 
              marginTop: '16px',
              borderRadius: '8px'
            }}
            headStyle={{
              fontSize: '14px',
              padding: '12px 16px'
            }}
            styles={{
              body: {
                padding: '12px 16px'
              }
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>
                {stats.completedTasks > 0 && stats.totalTasks > 0 
                  ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% concluído`
                  : 'Nenhuma tarefa ainda'
                }
              </span>
              <Button 
                type="link" 
                size="small"
                onClick={() => navigate('/tasks')}
                style={{ fontSize: '12px', padding: '0' }}
              >
                Ver todas →
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;