import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IComment } from './comment.schema';

@Injectable()
export class CommentService {
  // só pode ser acessada pela classe
  constructor(
    private httpService: HttpService,

    @InjectModel('Comment')
    private commentModel: Model<IComment>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    try {
      await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/users/${createCommentDto.user_id}`,
        ),
      );
      const newComment = new this.commentModel(createCommentDto);

      const savedComment = await newComment.save();

      return savedComment;
    } catch (err) {
      throw new NotFoundException('Card não encontrado');
    }
  }

  async findAll() {
    const comments = await this.commentModel.find();

    return comments.map((comment: IComment) => formatComment(comment));
  }

  async findOne(id: string) {
    try {
      const comment = await this.commentModel.findById(id);

      if (!comment) {
        throw new NotFoundException(`Comentário ${id} não encontrado`);
      }

      return formatComment(comment);
    } catch (err) {
      throw new NotFoundException(`Comentário ${id} não encontrado`);
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    await this.findOne(id);

    await this.commentModel.findOneAndUpdate({ _id: id }, updateCommentDto);

    const updatedComment = await this.findOne(id);

    return formatComment(updatedComment);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.commentModel.findByIdAndDelete(id);
  }

  async findByUserId(id: string) {
    try {
      const comments = await this.commentModel.find({ user_id: id });

      if (!comments) {
        throw new NotFoundException(
          `Comentário do usuario ${id} não encontrado`,
        );
      }
      return comments.map((comment: IComment) => formatComment(comment));
    } catch (err) {
      throw new NotFoundException(`Comentário do usuario ${id} não encontrado`);
    }
  }
}

const formatComment = (comment: IComment) => ({
  id: comment.id,
  comment: comment.comment,
  user_id: comment.user_id,
});
