// import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
// import { User } from '../../users/entities/user.entity';

// @Entity()
// export class ActivityLog {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
//   user: User;

//   @Column()
//   action: string; // 'create', 'update', 'delete'

//   @Column()
//   entityType: string; // 'task', 'event'

//   @Column()
//   entityId: number; // Task/event ID

//   @Column({ type: 'jsonb', nullable: true })
//   details: any; // e.g., { title: "New Task" }

//   @CreateDateColumn()
//   createdAt: Date;
// }