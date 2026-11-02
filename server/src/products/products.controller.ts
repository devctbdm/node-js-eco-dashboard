
@Delete(':id')
@HttpCode(204)
@Can(ProductPolicy, 'delete')
remove(@Param('id') id: string) {
  this.productsService.remove(id);
}
