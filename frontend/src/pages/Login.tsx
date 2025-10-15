import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      console.log('Tentando fazer login com:', values);
      
      // Usar o método loginWithCredentials do AuthContext
      await loginWithCredentials({
        email: values.email,
        password: values.password
      });
      
      console.log('Login realizado com sucesso via AuthContext');
      message.success('Login realizado com sucesso!');
      
      console.log('Navegando para dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      message.error('Email ou senha incorretos!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          TaskForU
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{
            email: "admin@taskforu.com",
            password: "admin123"
          }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, insira seu email!' },
              { type: 'email', message: 'Email inválido!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 16, color: '#666' }}>
          <small>
            Usuário: admin@taskforu.com<br />
            Senha: admin123
          </small>
        </div>
      </Card>
    </div>
  );
};

export default Login;