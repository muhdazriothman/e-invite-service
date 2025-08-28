import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

import { CreateInvitationDto } from './dtos/create';
import { UpdateInvitationDto } from './dtos/update';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { InvitationMapper, InvitationDto } from './mapper';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationController {
    constructor(
        private readonly createInvitationUseCase: CreateInvitationUseCase,
        private readonly listInvitationsUseCase: ListInvitationsUseCase,
        private readonly getInvitationByIdUseCase: GetInvitationByIdUseCase,
        private readonly updateInvitationUseCase: UpdateInvitationUseCase,
        private readonly deleteInvitationUseCase: DeleteInvitationUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new invitation' })
    @ApiResponse({
        status: 201,
        description: 'Invitation created successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation error',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - invitation already exists',
    })
    async createInvitation(@Body() createInvitationDto: CreateInvitationDto) {
        const invitation = await this.createInvitationUseCase.execute(createInvitationDto);
        return {
            statusCode: 201,
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all invitations' })
    @ApiResponse({
        status: 200,
        description: 'List of invitations retrieved successfully',
    })
    async listInvitations() {
        const invitations = await this.listInvitationsUseCase.execute();

        const data: InvitationDto[] = [];

        for (const invitation of invitations) {
            data.push(InvitationMapper.toDto(invitation));
        }

        return {
            statusCode: 200,
            data,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation retrieved successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    async getInvitationById(@Param('id') id: string) {
        const invitation = await this.getInvitationByIdUseCase.execute(id);

        return {
            statusCode: 200,
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation updated successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation error',
    })
    async updateInvitation(
        @Param('id') id: string,
        @Body() updateInvitationDto: UpdateInvitationDto,
    ) {
        const invitation = await this.updateInvitationUseCase.execute(id, updateInvitationDto);

        return {
            statusCode: 200,
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation deleted successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    async deleteInvitation(@Param('id') id: string) {
        await this.deleteInvitationUseCase.execute(id);

        return {
            statusCode: 200,
            message: 'Invitation deleted successfully',
        };
    }
}
