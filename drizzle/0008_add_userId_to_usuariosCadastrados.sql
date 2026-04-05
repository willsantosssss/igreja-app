-- Add userId column to usuariosCadastrados table
ALTER TABLE usuariosCadastrados ADD COLUMN userId INT NOT NULL UNIQUE AFTER id;
