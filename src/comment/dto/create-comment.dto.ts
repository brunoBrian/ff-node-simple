import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  user_id: string;

  @IsString()
  comment: string;
}
