import { Image } from 'src/entities/image.entity';
import { AbstractRepository, EntityRepository } from 'typeorm';

@EntityRepository(Image)
export class ImageRepository extends AbstractRepository<Image> {
  async save() {}
}
