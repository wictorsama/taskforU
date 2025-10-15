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
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilter, TaskStatus } from '../types';
import { tasksApi } from '../services/api';
import { useTask } from '../contexts/TaskContext';
import AppLayout from '../components/AppLayout';

const { Option } = Select;
const { TextArea } = Input;

const Tasks: React.FC = () => {
  const { tasks, loading, refreshTasks, refreshStats, addTask, updateTask, removeTask, totalCount } = useTask();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [filter, setFilter] = useState<TaskFilter>({
    page: 1,
    pageSize: 10
  });

  useEffect(() => {
    refreshTasks(filter);
  }, [refreshTasks, filter]);



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
      await tasksApi.deleteTask(taskId);
      removeTask(taskId);
      message.success('Tarefa excluída com sucesso!');
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
        updateTask(editingTask.id, updatedTask); // Atualiza o contexto local
        message.success('Tarefa atualizada com sucesso!');
      } else {
        const createData: CreateTaskDto = {
          title: values.title,
          description: values.description
        };
        const newTask = await tasksApi.createTask(createData);
        addTask(newTask); // Adiciona ao contexto local
        message.success('Tarefa criada com sucesso!');
      }
      setModalVisible(false);
      refreshStats(); // Atualiza apenas as estatísticas
    } catch (error) {
      message.error('Erro ao salvar tarefa');
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await tasksApi.updateTask(taskId, { status });
      updateTask(taskId, updatedTask); // Atualiza o contexto local
      message.success('Status atualizado com sucesso!');
      refreshStats(); // Atualiza apenas as estatísticas
    } catch (error) {
      message.error('Erro ao atualizar status');
    }
  };

  const columns = [
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={status === TaskStatus.Done ? 'green' : 'orange'}>
          {status === TaskStatus.Done ? 'Concluída' : 'Pendente'}
        </Tag>
      )
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Task) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            type="link"
            onClick={() => handleStatusChange(
              record.id,
              record.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done
            )}
          >
            {record.status === TaskStatus.Done ? 'Marcar Pendente' : 'Marcar Concluída'}
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta tarefa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <AppLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title="Gerenciar Tarefas"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nova Tarefa
            </Button>
          }
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar tarefas..."
                prefix={<SearchOutlined />}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filtrar por status"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => setFilter({ ...filter, status: value })}
              >
                <Option value={TaskStatus.Pending}>Pendente</Option>
                <Option value={TaskStatus.Done}>Concluída</Option>
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{
              current: filter.page,
              pageSize: filter.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} itens`,
              pageSizeOptions: ['5', '10', '20', '50'],
              onChange: (page, pageSize) => setFilter({ ...filter, page, pageSize: pageSize || 10 })
            }}
          />
        </Card>

        <Modal
          title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
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
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingTask ? 'Atualizar' : 'Criar'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  Cancelar
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