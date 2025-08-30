import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  nodes: any[];

  @IsArray()
  edges: any[];
}