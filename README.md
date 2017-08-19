# font2triangles.js is...
JavaScript convertation of *.ttf font file to array of triangles for 3D graphics

![alt text](https://raw.githubusercontent.com/openMolNike/font2triangles.js/master/demo_test.png)

# This is not a lib for using in final app!
This is a script for getting pre-compiled json file which can be used without this script.

# Usage:
1) Just use font_ready.json file if you like "Oswald-Medium_modified.ttf". This file contains polygons of each chars.
2) Code 3d-render by yourself. You can build string polygons char by char by putting it into right (x,y) position.

# JSON triangle structure:
array of objects with fields:
1) "id" is char
2) "w" is max char x value. Use it to move x position of next char when you render it
3) "poly" is main triangles array: 
  triangle1point1.x, triangle1point1.y, triangle1point2.x, triangle1point2.y, triangle1point3.x, triangle1point3.y,
  triangle2point1.x, triangle2point1.y, triangle2point2.x, triangle2point2.y, triangle2point3.x, triangle2point3.y,
  ... and so on. Only x and y coordinates!
4) "contour" is optional array ща borders with same structure

# Pre-compile your font file by yourself:
1) Copy files to your web server
2) Copy your font file to the same directory
3) Edit in "run_me.html": var fontname & (optional) var font_char 
4) Run "run_me.html" via web browser
5) Copy last textbox value into "\*.json" file
6) Use it in your 3d application

# Problems:
1) There is no space char width. You can use width of "w" char for example.
2) Small font sizes can case errors in libs. Just use big font size and scale sown the result.
3) Most of fonts use curve lines. This script use it as straight lines. Test "Oswald-Medium_original.ttf". You will see only blu points. I modified this font for better triangle structure.

![alt text](https://raw.githubusercontent.com/openMolNike/font2triangles.js/master/font_compare.png)

# Main function shortly:
```html
<script src="libs/opentype@0.7.3.js"></script>      <!--Get font SVG path-->
<script src="libs/js-svg-path@1.1.0.js"></script>   <!--SVG to point array-->
<script src="libs/clipper@6.2.1.js"></script>       <!--Boolean operations for holes check-->
<script src="libs/jsts.min@1.2.1.js"></script>      <!--Second color countors-->
<script src="libs/poly2tri@1.5.0.js"></script>      <!--Final triangulation-->
<script src="font2triangles.js"></script>
```
```js
opentype.load("Oswald-Medium_modified.ttf", function(err, font) {
  var fontdata = getFontTriangles(font,"abcd......zABC.....Z......",100,10);
  alert(JSON.stringify({arr:fontdata.triangles}));
}
```

# Used libs:
1) https://github.com/nodebox/opentype.js
2) https://github.com/Pomax/js-svg-path
3) https://sourceforge.net/projects/jsclipper/
4) https://github.com/bjornharrtell/jsts
5) https://github.com/r3mi/poly2tri.js

# License:
You are free to do everything you want with my code! But check lib's Licenses.
