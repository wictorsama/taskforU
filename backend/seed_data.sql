;-- Inserir usuário de teste
INSERT INTO "Users" ("Name", "Email", "PasswordHash", "CreatedAt", "UpdatedAt", "IsActive") 
VALUES ('Admin', 'admin@taskforu.com', '$2a$11$dummy.hash.for.testing.purposes', NOW(), NOW(), true);

-- Inserir tarefas de teste
INSERT INTO "Tasks" ("Id", "Title", "Description", "Status", "CreatedAt", "UserId") 
VALUES 
    (gen_random_uuid(), 'Primeira Tarefa', 'Descrição da primeira tarefa', 0, NOW(), 1),
    (gen_random_uuid(), 'Segunda Tarefa', 'Descrição da segunda tarefa', 1, NOW(), 1),
    (gen_random_uuid(), 'Terceira Tarefa', 'Descrição da terceira tarefa', 0, NOW(), 1);