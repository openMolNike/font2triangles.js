# font2triangles.js is...
JavaScript convertation of *.ttf font file to array of triangles of 3D graphics

![alt text](https://raw.githubusercontent.com/openMolNike/font2triangles.js/master/demo_test.png)

# This is not a lib for usage with final app
This is a script for getting pre-compiled json file which can be used without this script.

# Usage:
Just use font_ready.json file if you like "Oswald-Medium_modified.ttf".
This file contains polygons of each chars. You can build string polygons char by char yourself.

# JSON triangle structure:
array of objects with fields:
1) "id" is char
2) "w" is max char x value. Use it to move x position of next char when you render it
3) "poly" is main triangles array: 
  triangle1point1.x, triangle1point1.y, triangle1point2.x, triangle1point2.y, triangle1point3.x, triangle1point3.y,
  triangle2point1.x, triangle2point1.y, triangle2point2.x, triangle2point2.y, triangle2point3.x, triangle2point3.y,
  ... and so on. Only x and y coordinates!
4) "contour" is optional array with same structure

# Render font by yourself:
1) copy files to your web server
2) copy your font file to the same directory
3) edit in "run_me.html": var fontname & (optional) var font_char 
4) run "run_me.html" via web browser
5) copy last textbox into "*.json" file
6) use it in your 3d application

# Problems
1) There is no space char width. use width of "w" char for example
2) Most of fonts use curve lines. This script use it as straight lines. Test Oswald-Medium_original.ttf

# Used libs
1) https://github.com/nodebox/opentype.js
2) https://github.com/Pomax/js-svg-path
3) https://sourceforge.net/projects/jsclipper/
4) https://github.com/bjornharrtell/jsts
5) https://github.com/r3mi/poly2tri.js

# License
Do everything you want! You are free.
