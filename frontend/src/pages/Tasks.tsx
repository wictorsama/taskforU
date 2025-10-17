import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  List,
  Avatar,
  Typography
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckOutlined,
  UndoOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilter, TaskStatus } from '../types';
import { tasksApi } from '../services/api';
import { useTask } from '../contexts/TaskContext';
import AppLayout from '../components/AppLayout';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

// Define placeholder type that extends Task
interface PlaceholderTask extends Task {
  isPlaceholder: boolean;
}

const Tasks: React.FC = () => {
  const { tasks, loading, refreshTasks, refreshStats, updateTask, removeTask, addTask, totalCount } = useTask();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<TaskFilter>({
    page: 1,
    pageSize: 10
  });
  const [searchValue, setSearchValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // SOLUÇÃO DEFINITIVA: Eliminar completamente o warning do Ant Design
  const safeDataSource = React.useMemo(() => {
    if (loading || !tasks) {
      return [];
    }
    
    // Sempre retornar apenas as tasks reais sem placeholders para evitar warnings
    return tasks.map(task => ({ ...task, isPlaceholder: false }));
  }, [tasks, loading]);

  // Verificar se é mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Debounce para a busca
  const debounceSearch = useCallback(
    (value: string) => {
      const timer = setTimeout(() => {
        setFilter(prev => ({ ...prev, search: value, page: 1 }));
      }, 500);
      return () => clearTimeout(timer);
    },
    []
  );

  useEffect(() => {
    refreshTasks(filter);
  }, [refreshTasks, filter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debounceSearch(value);
  };

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      // Calcular valores ANTES da exclusão
      const currentPage = filter.page || 1;
      const currentPageSize = filter.pageSize || 10;
      const newTotalCount = totalCount - 1; // Total após exclusão
      const maxPage = Math.ceil(newTotalCount / currentPageSize);
      
      // Executar a exclusão
      await tasksApi.deleteTask(taskId);
      
      // Para exclusão: apenas recarregar dados do servidor para garantir sincronização
      // Verificar se precisa redirecionar ANTES de recarregar
      if (currentPage > maxPage && maxPage > 0) {
        // Atualizar o filtro para a página correta
        const newFilter = { ...filter, page: maxPage };
        setFilter(newFilter);
        // Recarregar com o novo filtro
        await refreshTasks(newFilter);
      } else {
        // Recarregar dados normalmente se não precisar redirecionar
        await refreshTasks(filter);
      }
      
      message.success('Tarefa excluída com sucesso!');
      refreshStats();
    } catch (error) {
      message.error('Erro ao excluir tarefa');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTask) {
        const updateData: UpdateTaskDto = {
          title: values.title,
          description: values.description,
          status: values.status
        };
        const updatedTask = await tasksApi.updateTask(editingTask.id, updateData);
        updateTask(editingTask.id, updatedTask);
        message.success('Tarefa atualizada com sucesso!');
      } else {
        const createData: CreateTaskDto = {
          title: values.title,
          description: values.description
        };
        const newTask = await tasksApi.createTask(createData);
        
        // Para inclusão: apenas recarregar dados do servidor para garantir sincronização
        // Isso evita duplicação e garante que totalCount seja correto
        await refreshTasks(filter);
        message.success('Tarefa criada com sucesso!');
      }
      setModalVisible(false);
      refreshStats();
    } catch (error) {
      message.error('Erro ao salvar tarefa');
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, { status });
      updateTask(taskId, updatedTask);
      message.success('Status atualizado com sucesso!');
      refreshStats();
    } catch (error) {
      message.error('Erro ao atualizar status');
    }
  };

  // Colunas para desktop/tablet
  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      render: (text: string, record: PlaceholderTask) => {
        // Não renderizar placeholders
        if (record.isPlaceholder) return null;
        return <strong>{text}</strong>;
      }
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
      ellipsis: true,
      render: (text: string, record: PlaceholderTask) => {
        // Não renderizar placeholders
        if (record.isPlaceholder) return null;
        return text;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: TaskStatus, record: PlaceholderTask) => {
        // Não renderizar placeholders
        if (record.isPlaceholder) return null;
        return (
          <Tag color={status === TaskStatus.Done ? 'green' : 'orange'}>
            {status === TaskStatus.Done ? 'Concluída' : 'Pendente'}
          </Tag>
        );
      }
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '10%',
      render: (date: string, record: PlaceholderTask) => {
        // Não renderizar placeholders
        if (record.isPlaceholder) return null;
        return new Date(date).toLocaleDateString('pt-BR');
      }
    },
    {
      title: 'Ações',
      key: 'actions',
      width: '23%',
      render: (_: any, record: PlaceholderTask) => {
        // Não renderizar ações para placeholders
        if (record.isPlaceholder) return null;
        
        return (
          <Space size="small" wrap>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              title="Editar"
              onClick={() => handleEdit(record)}
            />
            <Button
              type="link"
              size="small"
              title={record.status === TaskStatus.Done ? 'Marcar como Pendente' : 'Marcar como Concluída'}
              onClick={() => handleStatusChange(
                record.id,
                record.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done
              )}
            >
              {record.status === TaskStatus.Done ? '↩️' : '✅'}
            </Button>
            <Popconfirm
              title="Tem certeza que deseja excluir esta tarefa?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                title="Excluir"
              />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  // Renderização para mobile (Lista)
  const renderMobileList = () => {
    return (
      <div>
        {safeDataSource.map((task: PlaceholderTask) => (
          <div key={task.id}>
            {task.isPlaceholder ? (
              <div style={{ height: '80px', visibility: 'hidden' }}>
                <div style={{ padding: '12px 16px' }}>
                  <Text style={{ opacity: 0 }}>Placeholder</Text>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: task.status === TaskStatus.Done ? '#52c41a' : '#faad14'
                  }}
                  icon={task.status === TaskStatus.Done ? <CheckOutlined /> : <UndoOutlined />}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <Text strong style={{ fontSize: '14px' }}>{task.title}</Text>
                    <Tag 
                      color={task.status === TaskStatus.Done ? 'green' : 'orange'}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      {task.status === TaskStatus.Done ? 'Concluída' : 'Pendente'}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    {task.description}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                    <Space size="small">
                      <Button
                        type="text"
                        size={isMobile ? 'middle' : 'large'}
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(task)}
                      />
                      <Button
                        type="text"
                        size={isMobile ? 'middle' : 'large'}
                        icon={task.status === TaskStatus.Done ? <UndoOutlined /> : <CheckOutlined />}
                        onClick={() => handleStatusChange(
                          task.id,
                          task.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done
                        )}
                      />
                      <Popconfirm
                        title="Excluir tarefa?"
                        onConfirm={() => handleDelete(task.id)}
                        okText="Sim"
                        cancelText="Não"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentPage = filter.page || 1;
  const currentPageSize = filter.pageSize || 10;

  return (
    <AppLayout>
      <div style={{ padding: isMobile ? '8px' : '24px' }}>
        <Card
          title={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: isMobile ? '16px' : '18px' }}>Gerenciar Tarefas</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size={isMobile ? 'middle' : 'large'}
              >
                {isMobile ? 'Nova' : 'Nova Tarefa'}
              </Button>
            </div>
          }
          styles={{ body: { padding: isMobile ? '12px' : '24px' } }}
        >
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar tarefas..."
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={handleSearchChange}
                size={isMobile ? 'middle' : 'large'}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filtrar por status"
                style={{ width: '100%' }}
                allowClear
                size={isMobile ? 'middle' : 'large'}
                onChange={(value) => setFilter({ ...filter, status: value, page: 1 })}
              >
                <Option value={TaskStatus.Pending}>Pendente</Option>
                <Option value={TaskStatus.Done}>Concluída</Option>
              </Select>
            </Col>
          </Row>

          {isMobile ? (
            <>
              {renderMobileList()}
              {!loading && totalCount > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '16px',
                  padding: '8px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {((currentPage - 1) * currentPageSize) + 1}-{Math.min(currentPage * currentPageSize, totalCount)} de {totalCount} itens
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Button
                      size="small"
                      disabled={currentPage === 1}
                      onClick={() => setFilter({ ...filter, page: currentPage - 1 })}
                    >
                      Anterior
                    </Button>
                    <span style={{ margin: '0 8px', fontSize: '12px' }}>
                      Página {currentPage} de {Math.ceil(totalCount / currentPageSize)}
                    </span>
                    <Button
                      size="small"
                      disabled={currentPage >= Math.ceil(totalCount / currentPageSize)}
                      onClick={() => setFilter({ ...filter, page: currentPage + 1 })}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={safeDataSource as readonly PlaceholderTask[]}
                rowKey="id"
                loading={loading}
                scroll={{ x: 800 }}
                pagination={{
                  position: ['none'],
                  hideOnSinglePage: true,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  showTotal: () => null,
                  current: 1,
                  pageSize: safeDataSource.length || 10,
                  total: safeDataSource.length
                }}
                showSorterTooltip={false}
                size="middle"
                locale={{
                  emptyText: loading ? 'Carregando...' : 'Nenhuma tarefa encontrada'
                }}
              />
              
              {/* Paginação customizada sem conflitos com Ant Design */}
              {!loading && totalCount > 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 0'
                }}>
                  <div style={{ color: '#666' }}>
                    Mostrando {((currentPage - 1) * currentPageSize) + 1}-{Math.min(currentPage * currentPageSize, totalCount)} de {totalCount} itens
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Botão Anterior */}
                    <Button
                      disabled={currentPage <= 1}
                      onClick={() => setFilter({ ...filter, page: currentPage - 1 })}
                      icon={<LeftOutlined />}
                    >
                      Anterior
                    </Button>
                    
                    {/* Informação da página atual */}
                    <span style={{ margin: '0 16px', color: '#666' }}>
                      Página {currentPage} de {Math.ceil(totalCount / currentPageSize)}
                    </span>
                    
                    {/* Botão Próximo */}
                    <Button
                      disabled={currentPage >= Math.ceil(totalCount / currentPageSize)}
                      onClick={() => setFilter({ ...filter, page: currentPage + 1 })}
                      icon={<RightOutlined />}
                    >
                      Próximo
                    </Button>
                    
                    {/* Seletor de tamanho da página */}
                    <Select
                      value={filter.pageSize}
                      onChange={(pageSize) => setFilter({ ...filter, page: 1, pageSize })}
                      style={{ width: 100, marginLeft: '16px' }}
                    >
                      <Option value={5}>5 / página</Option>
                      <Option value={10}>10 / página</Option>
                      <Option value={20}>20 / página</Option>
                      <Option value={50}>50 / página</Option>
                    </Select>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Modal
          title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={isMobile ? '95%' : 520}
          style={isMobile ? { top: 20 } : {}}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Por favor, insira o título!' }]}
            >
              <Input placeholder="Digite o título da tarefa" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
              rules={[{ required: true, message: 'Por favor, insira a descrição!' }]}
            >
              <TextArea
                rows={4}
                placeholder="Digite a descrição da tarefa"
              />
            </Form.Item>

            {editingTask && (
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Por favor, selecione o status!' }]}
              >
                <Select placeholder="Selecione o status">
                  <Option value={TaskStatus.Pending}>Pendente</Option>
                  <Option value={TaskStatus.Done}>Concluída</Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingTask ? 'Atualizar' : 'Criar'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default Tasks;