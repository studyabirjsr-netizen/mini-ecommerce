import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entity/cart.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { ProductsService } from '../service/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const product = await this.productsService.findOne(addToCartDto.productId);

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

  
    let cartItem = await this.cartRepository.findOne({
      where: {
        userId,
        productId: addToCartDto.productId,
      },
    });

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + addToCartDto.quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      cartItem.quantity = newQuantity;
    } else {
      // Create new cart item
      cartItem = this.cartRepository.create({
        userId,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  async calculateCartTotal(userId: string): Promise<number> {
    const cartItems = await this.getCart(userId);
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }
}
