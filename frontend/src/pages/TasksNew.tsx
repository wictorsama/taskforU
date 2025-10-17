import React, { useState, useEffect } from 'react';
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
  Typography,
  Pagination,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckOutlined,
  UndoOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../types';
import { 
  useTasks, 
  useTaskStats, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask,
  useBulkOperations 
} from '../hooks/useTasks';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setCurrentPage, 
  setPageSize, 
  setSearch, 
  setStatus, 
  setPriority, 
  setSorting,
  setSelectedTasks,
  toggleTaskSelection,
  clearSelectedTasks,
  resetFilters
} from '../store/slices/uiSlice';
import AppLayout from '../components/AppLayout';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const TasksNew: React.FC = () => {
  // Redux state
  const dispatch = useAppDispatch();
  const { 
    currentPage, 
    pageSize, 
    filters, 
    selectedTasks 
  } = useAppSelector((state) => state.ui);

  // React Query hooks
  const { data: tasksData, isLoading, error, refetch } = useTasks();
  const { data: stats } = useTaskStats();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { bulkDelete, bulkUpdate } = useBulkOperations();

  // Local state para modais
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();

  // Dados das tarefas
  const tasks = tasksData?.tasks || [];
  const totalCount = tasksData?.totalCount || 0;

  // Handlers para filtros
  const handleSearch = (value: string) => {
    dispatch(setSearch(value));
  };

  const handleStatusFilter = (status: number | undefined) => {
    dispatch(setStatus(status));
  };

  const handlePriorityFilter = (priority: number | undefined) => {
    dispatch(setPriority(priority));
  };

  const handlePageChange = (page: number, size?: number) => {
    dispatch(setCurrentPage(page));
    if (size && size !== pageSize) {
      dispatch(setPageSize(size));
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field && sorter.order) {
      dispatch(setSorting({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      }));
    }
  };

  // Handlers para tarefas
  const handleCreateTask = async (values: CreateTaskDto) => {
    try {
      await createTaskMutation.mutateAsync({
        ...values,
        status: 'Pending',
        userId: 'current-user-id' // Isso deveria vir do contexto de autenticação
      } as any);
      message.success('Tarefa criada com sucesso!');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Erro ao criar tarefa');
    }
  };

  const handleUpdateTask = async (values: UpdateTaskDto) => {
    if (!editingTask) return;
    
    try {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        task: values
      });
      message.success('Tarefa atualizada com sucesso!');
      setModalVisible(false);
      setEditingTask(null);
      form.resetFields();
    } catch (error) {
      message.error('Erro ao atualizar tarefa');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTaskMutation.mutateAsync(id);
      message.success('Tarefa excluída com sucesso!');
    } catch (error) {
      message.error('Erro ao excluir tarefa');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === TaskStatus.Pending ? TaskStatus.Completed : TaskStatus.Pending;
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        task: { status: newStatus }
      });
      message.success(`Tarefa ${newStatus === TaskStatus.Completed ? 'concluída' : 'reaberta'}!`);
    } catch (error) {
      message.error('Erro ao atualizar status da tarefa');
    }
  };

  // Handlers para seleção em lote
  const handleRowSelection = {
    selectedRowKeys: selectedTasks,
    onChange: (selectedRowKeys: React.Key[]) => {
      dispatch(setSelectedTasks(selectedRowKeys as string[]));
    },
    onSelect: (record: Task, selected: boolean) => {
      dispatch(toggleTaskSelection(record.id));
    },
    onSelectAll: (selected: boolean, selectedRows: Task[], changeRows: Task[]) => {
      if (selected) {
        const allIds = tasks.map(task => task.id);
        dispatch(setSelectedTasks(allIds));
      } else {
        dispatch(clearSelectedTasks());
      }
    },
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    try {
      await bulkDelete.mutateAsync(selectedTasks);
      message.success(`${selectedTasks.length} tarefas excluídas com sucesso!`);
      dispatch(clearSelectedTasks());
    } catch (error) {
      message.error('Erro ao excluir tarefas');
    }
  };

  const handleBulkStatusUpdate = async (status: TaskStatus) => {
    if (selectedTasks.length === 0) return;
    
    try {
      await bulkUpdate.mutateAsync({
        ids: selectedTasks,
        updates: { status }
      });
      message.success(`${selectedTasks.length} tarefas atualizadas com sucesso!`);
      dispatch(clearSelectedTasks());
    } catch (error) {
      message.error('Erro ao atualizar tarefas');
    }
  };

  // Modal handlers
  const showCreateModal = () => {
    setEditingTask(null);
    setModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (task: Task) => {
    setEditingTask(task);
    setModalVisible(true);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

  const handleModalSubmit = async (values: any) => {
    if (editingTask) {
      await handleUpdateTask(values);
    } else {
      await handleCreateTask(values);
    }
  };

  // Colunas da tabela
  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text: string, record: Task) => (
        <Space>
          <Text strong={record.status === TaskStatus.Pending}>
            {text}
          </Text>
          {record.status === TaskStatus.Completed && (
            <CheckOutlined style={{ color: '#52c41a' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (status: TaskStatus) => (
        <Tag color={status === TaskStatus.Completed ? 'green' : 'orange'}>
          {status === TaskStatus.Completed ? 'Concluída' : 'Pendente'}
        </Tag>
      ),
    },
    {
      title: 'Prioridade',
      dataIndex: 'priority',
      key: 'priority',
      sorter: true,
      render: (priority: number) => {
        const colors = { 0: 'blue', 1: 'orange', 2: 'red' };
        const labels = { 0: 'Baixa', 1: 'Média', 2: 'Alta' };
        return (
          <Tag color={colors[priority as keyof typeof colors]}>
            {labels[priority as keyof typeof labels]}
          </Tag>
        );
      },
    },
    {
      title: 'Criada em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          <Button
            type="text"
            icon={record.status === TaskStatus.Pending ? <CheckOutlined /> : <UndoOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.status === TaskStatus.Pending ? 'Marcar como concluída' : 'Reabrir tarefa'}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Tem certeza que deseja excluir esta tarefa?"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar tarefas..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={handleStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={TaskStatus.Pending}>Pendente</Option>
                <Option value={TaskStatus.Completed}>Concluída</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Prioridade"
                value={filters.priority}
                onChange={handlePriorityFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value={0}>Baixa</Option>
                <Option value={1}>Média</Option>
                <Option value={2}>Alta</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                  loading={createTaskMutation.isPending}
                >
                  Nova Tarefa
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  loading={isLoading}
                >
                  Atualizar
                </Button>
                {selectedTasks.length > 0 && (
                  <>
                    <Button
                      danger
                      onClick={handleBulkDelete}
                      loading={bulkDelete.isPending}
                  >
                    Excluir ({selectedTasks.length})
                  </Button>
                  <Button
                    onClick={() => handleBulkStatusUpdate(TaskStatus.Completed)}
                    loading={bulkUpdate.isPending}
                  >
                      Concluir ({selectedTasks.length})
                    </Button>
                  </>
                )}
              </Space>
            </Col>
          </Row>

          {error && (
            <div style={{ marginBottom: 16, color: 'red' }}>
              Erro ao carregar tarefas. <Button type="link" onClick={() => refetch()}>Tentar novamente</Button>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={isLoading || createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending}
            pagination={false}
            onChange={handleTableChange}
            rowSelection={handleRowSelection}
            scroll={{ x: 800 }}
            showSorterTooltip={false}
            size="middle"
            locale={{
              emptyText: isLoading ? 'Carregando...' : 'Nenhuma tarefa encontrada'
            }}
          />

          <div style={{ 
            marginTop: 16, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <Text type="secondary">
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} de {totalCount} itens
            </Text>
            
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCount}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} de ${total} itens`
              }
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        </Card>

        {/* Modal para criar/editar tarefa */}
        <Modal
          title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          open={modalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleModalSubmit}
          >
            <Form.Item
              name="title"
              label="Título"
              rules={[{ required: true, message: 'Por favor, insira o título da tarefa' }]}
            >
              <Input placeholder="Digite o título da tarefa" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Descrição"
              rules={[{ required: true, message: 'Por favor, insira a descrição da tarefa' }]}
            >
              <TextArea
                rows={4}
                placeholder="Digite a descrição da tarefa"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  initialValue={TaskStatus.Pending}
                >
                  <Select>
                    <Option value={TaskStatus.Pending}>Pendente</Option>
                    <Option value={TaskStatus.Completed}>Concluída</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Prioridade"
                  initialValue={0}
                >
                  <Select>
                    <Option value={0}>Baixa</Option>
                    <Option value={1}>Média</Option>
                    <Option value={2}>Alta</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleModalCancel}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createTaskMutation.isPending || updateTaskMutation.isPending}
                >
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

export default TasksNew;