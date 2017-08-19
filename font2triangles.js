function getFontTriangles(font,font_chars,fontsize,spacing) {

    function clipPath(subj, clip, mode, isarr) {
        var ct_mode = null;
        if(mode=="and") ct_mode = ClipperLib.ClipType.ctIntersection;
        if(mode=="or") ct_mode = ClipperLib.ClipType.ctUnion;
        if(mode=="not") ct_mode = ClipperLib.ClipType.ctDifference;
        if(ct_mode===null) return null;
        var subj_paths = subj;
        var clip_paths = clip;
        if(isarr){
            function from_arr(arr){
                var paths=[];
                for(var k=0;k<arr.length;k++){
                    var paths2 = [];
                    for(var t=0;t<arr[k].length;t++){
                        paths2.push({X:arr[k][t][0],Y:arr[k][t][1]});
                    }
                    paths.push(paths2);
                }
                return paths
            };
            subj_paths = from_arr(subj);
            clip_paths = from_arr(clip);
        }
        var cpr = new ClipperLib.Clipper();
        cpr.AddPaths(subj_paths, ClipperLib.PolyType.ptSubject, true);  // true means closed path
        cpr.AddPaths(clip_paths, ClipperLib.PolyType.ptClip, true);
        var result = new ClipperLib.Paths();
        var succeeded = cpr.Execute(ct_mode, result, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
        if(isarr){
            var arr=[];
            for(var k=0;k<result.length;k++){
                var paths2 = [];
                for(var t=0;t<result[k].length;t++){
                    paths2.push([result[k][t].X,result[k][t].Y]);
                }
                arr.push(paths2);
            }
            return arr;
        }else{
            return result;
        }
    }

    function correctHoles(char_arr) {
        if(char_arr.length<2){ // holes impossible
            return [char_arr];
        }
        var arr = [];
        for(var j=0; j<char_arr.length; j++){
            var subj = [char_arr[j]];
            for(var k=0; k<char_arr.length; k++){
                if(k!==j){
                    subj = clipPath(subj, [char_arr[k]], "not", true);
                }
            }
            if(subj.length>0){
                arr.push(subj);
            }
        }
        return arr;
    };

    function rebuildNoDoubles(path){
        if(path.length>0){
            var arr=[];
            arr.push(path[0]); // first
            var prev = path[0];
            for(var j=1; j<path.length; j++){ // next !=pervious
                if(!(path[j][0]==prev[0] && path[j][1]==prev[1])){
                    arr.push(path[j]);
                    prev = path[j];
                }
            }
            while(arr.length>0 && arr[arr.length-1][0]==arr[0][0] && arr[arr.length-1][1]==arr[0][1]){ // last!=first
                arr.pop();
            }
            return arr;
        }
        return [];
    };

    function triangulate(shape,v_pos){
        var swctx = null;
        for(var k=0;k<shape.length;k++){
            var t_path = [];
            for(var t=0;t<shape[k].length;t++){
                var tr_p = new poly2tri.Point(shape[k][t][0], shape[k][t][1]);
                t_path.push(tr_p);
            }
            if(k==0){
                swctx = new poly2tri.SweepContext(t_path);
            }else{
                swctx.addHole(t_path);
            }
        }
        swctx.triangulate();
        var triangles = swctx.getTriangles();
        triangles.forEach(function(tvar) {
            for(var j=0;j<3;j++){
                var tp = tvar.getPoint(j);
                v_pos.push(tp.x);
                v_pos.push(tp.y);
            }
        });
    };

    function inflatePolygon(poly, spacing) {
        var geoInput = [];
        for(var i=0; i<poly.length; i++) {
            geoInput.push(new jsts.geom.Coordinate(poly[i][0], poly[i][1]));
        }
        if(poly[0][0]!==poly[poly.length-1][0] || poly[0][1]!==poly[poly.length-1][1]){
            geoInput.push(geoInput[0]);
        }
        var geometryFactory = new jsts.geom.GeometryFactory();
        var shell = geometryFactory.createPolygon(geoInput);
        var polygon = shell.buffer(spacing, jsts.operation.buffer.BufferParameters.CAP_FLAT);
        var p1 = polygon.shell.points.coordinates;
        var p2 = [];
        for(var i=0; i<p1.length; i++) { //
            var oItem = p1[i];
            p2.push([Math.ceil(oItem.x), Math.ceil(oItem.y)]);
        }
        return p2;
    }

    var font_data = font_chars.split(''); // to array
    var obj = [];

    // main converter
    for(var j=0; j<font_chars.length; j++){
        var char_j = font_chars[j];
        var chars_arr = [];
        // opentype lib
        var path = font.getPath(char_j, 0, 0, fontsize);
        var data = path.toPathData(2);
        // js-svg-path lib
        var outline = new PathConverter.Outline();
        var parser = new PathConverter.SVGParser(outline);
        parser.parse(data);
        outline.getShapes().forEach(shape => {
            if(shape!==null){
                var shapearr = [];
                shape.points.forEach(p => {
                   shapearr.push([p.main.x,p.main.y]);
                });
                chars_arr.push(shapearr);
            }
        });
        obj.push({"id":char_j,path:chars_arr});
    }

    //calc width
    for(var j=0; j<obj.length; j++){
        var o = obj[j];
        var w=0;
        for(var t=0; t<o.path.length; t++){
            for(var k=0; k<o.path[t].length; k++){
                if(o.path[t][k][0]>w) w = o.path[t][k][0];
            }
        }
        o.w=w;
    }

    //what is area and what is hole? (triangulation is not so smart)
    var shapes=[];
    for(var j=0; j<obj.length; j++){
        var shape0 = correctHoles(obj[j].path);
        shapes.push({"id":obj[j].id,w:obj[j].w,shape:shape0});
    }

    //remove double points (or triangulation will fail)
    for(var j=0; j<shapes.length; j++){
        var shape0 = shapes[j].shape;
        for(var i=0; i<shape0.length; i++){
            for(var k=0; k<shape0[i].length; k++){
                shape0[i][k] = rebuildNoDoubles(shape0[i][k]);
            }
        }
    }

    //triangulate
    var tri=[];
    var bugs=[];
    var j=0;
    for(j=0; j<shapes.length; j++){
        try{
            var shape0 = shapes[j].shape;
            var v_pos = [];
            for(var i=0; i<shape0.length; i++){
                triangulate(shape0[i],v_pos);
            }
            tri.push({"id":shapes[j].id,w:shapes[j].w,poly:v_pos});
        }catch(e){
            console.log("problem char: "+shapes[j].id);
            bugs.push(shapes[j].id);
            alertError(e, "getFontTriangles");
        }
    }

    // second color contours
    for(j=0; j<shapes.length; j++){
        try{
            var shape0 = shapes[j].shape;
            var v_pos = [];
            for(var i=0; i<shape0.length; i++){
                try{
                    var contour = inflatePolygon(shape0[i][0], spacing);
                    contour = rebuildNoDoubles(contour);
                    var contours = [contour,shape0[i][0]];
                    triangulate(contours,v_pos);
                }catch(e){
                    console.log("problem char for contour: "+shapes[j].id);
                    alertError(e, "getFontContour");
                }
                for(var k=1; k<shape0[i].length; k++){ // for holes
                    triangulate([shape0[i][k]],v_pos);
                }
            }
            for(var i=0; i<tri.length; i++){
                if(shapes[j].id===tri[i].id){
                    tri[i].contour = v_pos;
                }
            }
        }catch(e0){
            console.log("problem char for contour: "+shapes[j].id);
            alertError(e, "getFontContour");
        }
    }

    return {
        paths:obj,
        shapes:shapes,
        triangles:tri,
        bugs:bugs
    };
}
