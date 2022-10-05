import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  comment: string;
}
