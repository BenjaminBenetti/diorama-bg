# Diorama Bg Library

This library provides methods and classes to help you create a beautiful diorama background for your website.
The backgrounds are dynamic, made of multiple layers, and can include interacting elements between the layers such 
as lighting and filters.

## Usage

The to use this library construct the `DioramaController`. targeting the element you want to use as the container for the diorama.
```
const dioramaController = new DioramaController(htmlElementToUseAsContainer)
```

Then start defining the layers. A very simple setup would be 
```
dioramaController.addLayer(new ImageLayer("https://image.url", <layer index. zero is nearest to camera>))
```

This is the most basic usage of the diorama layers. With this you should simply be able to layer a few images on top of each other.