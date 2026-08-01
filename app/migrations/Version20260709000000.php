<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260709000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial schema: family_member, event, participant, responsibility';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE family_member (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            avatar_colour VARCHAR(7) NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE `event` (
            id INT AUTO_INCREMENT NOT NULL,
            title VARCHAR(255) NOT NULL,
            start_at DATETIME NOT NULL,
            end_at DATETIME DEFAULT NULL,
            all_day TINYINT(1) NOT NULL,
            recurrence_frequency VARCHAR(20) DEFAULT NULL,
            recurrence_interval INT NOT NULL,
            recurrence_days_of_week JSON DEFAULT NULL,
            recurrence_until DATE DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE participant (
            id INT AUTO_INCREMENT NOT NULL,
            event_id INT NOT NULL,
            member_id INT NOT NULL,
            INDEX IDX_D79F6B1171F7E88B (event_id),
            INDEX IDX_D79F6B117597D3FE (member_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_participant_event FOREIGN KEY (event_id) REFERENCES `event` (id) ON DELETE CASCADE,
            CONSTRAINT FK_participant_member FOREIGN KEY (member_id) REFERENCES family_member (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE responsibility (
            id INT AUTO_INCREMENT NOT NULL,
            event_id INT NOT NULL,
            member_id INT NOT NULL,
            label VARCHAR(100) NOT NULL,
            INDEX IDX_responsibility_event (event_id),
            INDEX IDX_responsibility_member (member_id),
            PRIMARY KEY(id),
            CONSTRAINT FK_responsibility_event FOREIGN KEY (event_id) REFERENCES `event` (id) ON DELETE CASCADE,
            CONSTRAINT FK_responsibility_member FOREIGN KEY (member_id) REFERENCES family_member (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE responsibility');
        $this->addSql('DROP TABLE participant');
        $this->addSql('DROP TABLE `event`');
        $this->addSql('DROP TABLE family_member');
    }
}
