import { AdminAuthGuard } from '@auth/interfaces/http/guards/admin-auth';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePaymentUseCase } from '@payment/application/use-cases/create';
import { DeletePaymentUseCase } from '@payment/application/use-cases/delete';
import { GetPaymentByIdUseCase } from '@payment/application/use-cases/get-by-id';
import { ListPaymentsUseCase } from '@payment/application/use-cases/list';
import { UpdatePaymentUseCase } from '@payment/application/use-cases/update';
import { CreatePaymentDto } from '@payment/interfaces/http/dtos/create';
import { UpdatePaymentDto } from '@payment/interfaces/http/dtos/update';
import {
  PaymentMapper,
  PaymentDto,
  PaymentResponseDto,
  PaymentListResponseDto,
} from '@payment/interfaces/http/mapper';

@ApiTags('payments')
@Controller('payments')
@UseGuards(AdminAuthGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
    private readonly getPaymentByIdUseCase: GetPaymentByIdUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly deletePaymentUseCase: DeletePaymentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - payment with this reference already exists',
  })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    // TODO: Get current admin user ID from JWT token
    const createdBy = 'admin-user-id'; // This should come from the authenticated user

    const payment = await this.createPaymentUseCase.execute(
      createPaymentDto,
      createdBy,
    );

    return {
      message: 'Payment created successfully',
      data: PaymentMapper.toDto(payment),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all payment records' })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
    type: PaymentListResponseDto,
  })
  async listPayments() {
    const payments = await this.listPaymentsUseCase.execute();

    return {
      message: 'Payments retrieved successfully',
      data: payments.map((payment) => PaymentMapper.toDto(payment)),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment record by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async getPaymentById(@Param('id') id: string) {
    const payment = await this.getPaymentByIdUseCase.execute(id);

    return {
      message: 'Payment retrieved successfully',
      data: PaymentMapper.toDto(payment),
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payment record' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid status transition',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - payment with this reference already exists',
  })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    const payment = await this.updatePaymentUseCase.execute(
      id,
      updatePaymentDto,
    );

    return {
      message: 'Payment updated successfully',
      data: PaymentMapper.toDto(payment),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment record' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 204,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async deletePayment(@Param('id') id: string) {
    await this.deletePaymentUseCase.execute(id);

    return {
      message: 'Payment deleted successfully',
    };
  }
}
