<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260731000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create staple table for saved non-meal-plan shopping items';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE staple (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT NULL,
            quantity VARCHAR(100) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE staple');
    }
}
