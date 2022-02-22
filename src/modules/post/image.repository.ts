import { Image } from 'src/entities/Image';
import { AbstractRepository, EntityRepository } from 'typeorm';

@EntityRepository(Image)
export class ImageRepository extends AbstractRepository<Image> {
  async save() {}
}
