export class CreateSubtaskDto {
  title: string;
}

export class UpdateSubtaskDto {
  title?: string;
  completed?: boolean;
}
