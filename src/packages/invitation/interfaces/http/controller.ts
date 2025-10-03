import { JwtAuthGuard } from '@auth/interfaces/http/guards/jwt-auth';
import { CreateInvitationUseCase } from '@invitation/application/use-cases/create';
import { DeleteInvitationUseCase } from '@invitation/application/use-cases/delete';
import { GetInvitationByIdUseCase } from '@invitation/application/use-cases/get-by-id';
import { ListInvitationsUseCase } from '@invitation/application/use-cases/list';
import { UpdateInvitationUseCase } from '@invitation/application/use-cases/update';
import { CreateInvitationDto } from '@invitation/interfaces/http/dtos/create';
import { ListInvitationsQueryDto } from '@invitation/interfaces/http/dtos/list';
import { UpdateInvitationDto } from '@invitation/interfaces/http/dtos/update';
import {
    InvitationMapper,
    InvitationDto,
    InvitationResponseDto,
    InvitationListResponseDto,
} from '@invitation/interfaces/http/mapper';
import { RequestWithUser } from '@invitation/interfaces/http/middleware/user-context.middleware';
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('invitations')
@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationController {
    constructor (
        private readonly createInvitationUseCase: CreateInvitationUseCase,
        private readonly listInvitationsUseCase: ListInvitationsUseCase,
        private readonly getInvitationByIdUseCase: GetInvitationByIdUseCase,
        private readonly updateInvitationUseCase: UpdateInvitationUseCase,
        private readonly deleteInvitationUseCase: DeleteInvitationUseCase,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new invitation' })
    @ApiBody({ type: CreateInvitationDto })
    @ApiResponse({
        status: 201,
        description: 'Invitation created successfully',
        type: InvitationResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed',
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - invitation limit reached',
    })
    async createInvitation (
        @Body() createInvitationDto: CreateInvitationDto,
        @Request() req: RequestWithUser,
    ) {
        const invitation = await this.createInvitationUseCase.execute(
            req.userData,
            createInvitationDto,
        );

        return {
            message: 'Invitation created successfully',
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:
            'Get all invitations for the current user with bidirectional cursor pagination',
    })
    @ApiResponse({
        status: 200,
        description: 'List of invitations retrieved successfully',
        type: InvitationListResponseDto,
    })
    async listInvitations (
        @Request() req: RequestWithUser,
        @Query() query: ListInvitationsQueryDto,
    ) {
        const result = await this.listInvitationsUseCase.execute(
            req.userData,
            query.next,
            query.previous,
            query.limit,
        );

        const data: InvitationDto[] = [];

        for (const invitation of result.data) {
            data.push(InvitationMapper.toDto(invitation));
        }

        return {
            message: 'Invitations retrieved successfully',
            data,
            pagination: {
                nextCursor: result.nextCursor,
                previousCursor: result.previousCursor,
                hasNextPage: result.hasNextPage,
                hasPreviousPage: result.hasPreviousPage,
                count: result.count,
            },
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation retrieved successfully',
        type: InvitationResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    async getInvitationById (
        @Request() req: RequestWithUser,
        @Param('id') id: string,
    ) {
        const invitation = await this.getInvitationByIdUseCase.execute(
            req.userData,
            id,
        );

        return {
            message: 'Invitation retrieved successfully',
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation updated successfully',
        type: InvitationResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed',
    })
    async updateInvitation (
        @Request() req: RequestWithUser,
        @Param('id') id: string,
        @Body() updateInvitationDto: UpdateInvitationDto,
    ) {
        const invitation = await this.updateInvitationUseCase.execute(
            req.userData,
            id,
            updateInvitationDto,
        );

        return {
            message: 'Invitation updated successfully',
            data: InvitationMapper.toDto(invitation),
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete invitation by ID' })
    @ApiResponse({
        status: 200,
        description: 'Invitation deleted successfully',
    })
    @ApiResponse({
        status: 404,
        description: 'Invitation not found',
    })
    async deleteInvitation (
        @Param('id') id: string,
        @Request() req: RequestWithUser,
    ) {
        await this.deleteInvitationUseCase.execute(
            req.userData,
            id,
        );

        return {
            message: 'Invitation deleted successfully',
        };
    }
}
