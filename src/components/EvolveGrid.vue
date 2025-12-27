<!-- 
Southwestern University Computer Science Capstone - Spring 2020

Nicholai Benko
Bennet Leff
Cameron Henkel
Sarah Friday
Jaden Williams
Anna Krolikowski
-->

<!--
Evolution Component for the Picbreeder site
-->

<template>
<div>
  <div class="container" id="mainScreen"> 
    <div class="row">
        <canvas id="imagePlane" width="10" height="10"></canvas> 
      <div>
        <a class="btn btn-info btn-md" id = "startover_button">restart</a>
        <a class="btn btn-success btn-md" id = "evolve_button">mutate</a>
        <a class="btn btn-info btn-md" id = "save_png_button">save</a> 
      </div>
    </div>
  </div>
  <div class="container-fluid" id="secondScreen">
    <canvas id="selectedPlane" width="10" height="10"></canvas>
  </div>
</div>
</template>



<script>
//jquery
import * as jquery from '../lib/jquery-1.11.3.min.js'
var $ = jquery; //for jquery to work in vue.js


//Evolution libraries
import * as N from "../lib/neat";
import * as NetArt from "../lib/netart";
import * as R from "../lib/recurrent";

//History storage
import historyStorage from "../services/historyStorage";


export default {
  name: 'Grid',
  data () {
    return {}
  },
  
  mounted () {
  /* eslint-disable no-unused-vars */    //       <--- hides linting errors, dont delete

  /*globals paper, */
  /*jslint nomen: true, undef: true, sloppy: true */

  // neurogram: picbreeder clone written in js.

  /*
  @licstart  The following is the entire license notice for the
  JavaScript code in this page.
  Copyright (C) 2015 david ha, otoro.net, otoro labs
  The JavaScript code in this page is free software: you can
  redistribute it and/or modify it under the terms of the GNU
  General Public License (GNU GPL) as published by the Free Software
  Foundation, either version 3 of the License, or (at your option)
  any later version.  The code is distributed WITHOUT ANY WARRANTY;
  without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
  As additional permission under GNU GPL version 3 section 7, you
  may distribute non-source (e.g., minimized or compacted) forms of
  that code without the copy of the GNU GPL normally required by
  section 4, provided you include this license notice and a URL
  through which recipients can access the Corresponding Source.
  @licend  The above is the entire license notice
  for the JavaScript code in this page.
  */

    "use strict";
    // constants that control the app:

    var nRow = 5;
    var nCol = 5;
    var nImage = nRow * nCol;
    var thumbSize = 90; // actually 96, but for borders
    var fullThumbSize = thumbSize+2;

    document.getElementById('imagePlane').width = nCol*fullThumbSize+2;
    document.getElementById('imagePlane').height = nRow*fullThumbSize+2;

    var maxSelected = 5; // we can only evolve max of 4 genomes

    var genome = []; // 2d array of genomes
    var thumb = []; // 2d array of images

    var currSelected = 0;
    var lastSelected = -1;
    var selectionList = [];

    // second plane
    var chosenGenome;
    var bigimg;
    var bigThumbSize = 320;

    document.getElementById('selectedPlane').width = bigThumbSize;
    document.getElementById('selectedPlane').height = bigThumbSize;

    var canvas = document.getElementById('imagePlane');
    var ctx = canvas.getContext('2d');

    // large selected
    var canvas2 = document.getElementById('selectedPlane');
    var ctx2 = canvas2.getContext('2d');

    var colaGraph;

    function clearSelection() {
      // http://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
      var selection = ('getSelection' in window) ? window.getSelection() : ('selection' in document) ? document.selection : null;
      if ('removeAllRanges' in selection) selection.removeAllRanges();
      else if ('empty' in selection) selection.empty();
    }

    function getPicLoc(n) {
      var i, j;
      i = Math.floor(n/nRow);
      j = n % nCol;
      return [i, j];
    }

    // initialise NEAT library (set number of inputs and outputs
    N.init({nInput: 3, nOutput: 3});

    // initializes random genomes at the beginning
    function initAll() {
      var i, j;
      genome = [];
      thumb = [];
      lastSelected = -1;
      for (i=0;i<nRow;i++) {
        genome.push([]);
        thumb.push([]);
        for (j=0;j<nCol;j++) {
          genome[i].push(null);
          thumb[i].push(null);
        }
      }
    }

    function getWidth() {
      return $(window).width();
    }

    function getHeight() {
      return $(window).height();
    }

    function initGenome() {

      N.randomizeRenderMode();

      var i, j, k, m, n, m1, n1, m2, n2;
      for (i=0;i<nRow;i++) {
        for (j=0;j<nCol;j++) {
          genome[i][j] = new N.Genome();
        }
      }

      for (k=0;k<8;k++) {
        for (i=0;i<nRow;i++) {
          for (j=0;j<nCol;j++) {
            if (Math.random() < 0.5) genome[i][j].addRandomNode();
            if (Math.random() < 0.5) genome[i][j].addRandomConnection();
          }
        }

      }

    }

    // initialises all the images (must be run after genome array is populated)
    function initThumb() {
      var i, j;
      for (i=0;i<nRow;i++) {
        for (j=0;j<nCol;j++) {
          genome[i][j].roundWeights();
          thumb[i][j] = NetArt.genGenomeImage(genome[i][j], thumbSize, thumbSize);
        }
      }
    }

    function maskThumb(i, j) {
      ctx.fillStyle="rgba(255, 255, 255, 0.7)";
      ctx.fillRect(fullThumbSize*j+2, fullThumbSize*i+2, thumbSize, thumbSize);
    }

    function drawThumb(i, j) {
      ctx.putImageData(thumb[i][j].getCanvasImage(ctx), fullThumbSize*j+2, fullThumbSize*i+2);
    }

    function drawAllThumb() {
      var i, j;
      ctx.clearRect(0,0,fullThumbSize*5+2,fullThumbSize*5+2);
      for (i=0;i<nRow;i++) {
        for (j=0;j<nCol;j++) {
          drawThumb(i, j);
        }
      }
    }

    function outlineThumb(n, c, width) {
      // draws a box of color c around pic n
      ctx.beginPath();
      ctx.lineWidth=width;
      ctx.strokeStyle=c;
      var loc = getPicLoc(n);
      var i = loc[0];
      var j = loc[1];
      ctx.rect(j*fullThumbSize+1,i*fullThumbSize+1,fullThumbSize,fullThumbSize);
      ctx.stroke();
    }

    function updateSelected() {
      // clear old circle
      var i;
      for (i=0;i<nImage;i++) {
        outlineThumb(i, "#FFF", 4.0);
      }

      for (i=0;i<selectionList.length;i++) {
        outlineThumb(selectionList[i], "rgba(255,0,0, 1.0)", 2.0);
      }

      // draw new selected
      if (currSelected >= 0) outlineThumb(currSelected, "rgba(0, 255, 0, 1.0)", 2.0);
    }

    function drawBigImg(chosen) {
      bigimg = NetArt.genGenomeImage(chosen, bigThumbSize/1, bigThumbSize/1);
      ctx2.clearRect(0,0,bigThumbSize/1,bigThumbSize/1);
      ctx2.putImageData(bigimg.getCanvasImage(ctx), 0, 0);
      ctx2.scale(1, 1);
      ctx2.drawImage(canvas2, 0, 0);
    }

    function createThumbnailDataURL(genomeObj, size) {
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      var tempCtx = tempCanvas.getContext('2d');
      var img = NetArt.genGenomeImage(genomeObj, size, size);
      tempCtx.putImageData(img.getCanvasImage(tempCtx), 0, 0);
      return tempCanvas.toDataURL('image/png');
    }

    function initSecondScreen(selection) {
      var loc = getPicLoc(selection);
      var i, j;
      i = loc[0];
      j = loc[1];

      $(".col-fixed-640").css("width", bigThumbSize*2+"px");

      chosenGenome = genome[i][j].copy();
      chosenGenome.roundWeights();

      drawBigImg(chosenGenome);
    }

    $("#secondScreen").hide();
    $("#mainScreen").hide();
    $("#imagePlane").mousemove(function( event ) {
      var rect = canvas.getBoundingClientRect();
      var x = (event.pageX - rect.left - 1);
      var y = (event.pageY - rect.top - 1);
      if (x < 0 || y < 0) return;
      var j = Math.floor(x/fullThumbSize);
      var i = Math.floor(y/fullThumbSize);
      //console.log('x, y = '+x+","+y+'\ti, j = '+i+","+j);
      var selected = i*nRow+j;
      if (selected >= nImage) return;
      if (selected !== currSelected) {
        currSelected = selected;
        updateSelected();
      }
    });
    $("#imagePlane").mouseout(function( event ) {
      currSelected = -1;
      updateSelected();
    });

    $("#imagePlane").click(function(){
      $("#origPicBreederLink").hide();
      var ix = selectionList.indexOf(currSelected);
      lastSelected = currSelected;
      if (ix === -1) {
        while (selectionList.length >= maxSelected) {
          selectionList.shift();
        }
        selectionList.push(currSelected);
      } else {
        selectionList.splice(ix, 1);
      }
      updateSelected();

    });


    $("#startover_button").click(function(){
      console.log('starting over...');
      initAll();
      initGenome();
      initThumb();
      drawAllThumb();
    });

    //save_button does not actually save, it is not in original neurogram code
    //NB - all this does is output the gene to JSON for database purposes - doesn't do anything but print it out right now
    $("#save_button").click(function(){
      console.log('saving!...');
      var len = selectionList.length;
      var i;
      for(i=0; i<len; i++){
        var name = prompt("what would you like your picture to be called?")
        var gene = getThing(genome, selectionList[i])
        console.log(gene);
        console.log(gene.toJSON(name));
      }

    });

    function getThing(thing, k) {
      var i, j;
      var loc;
      loc = getPicLoc(k);
      i = loc[0];
      j = loc[1];
      return thing[i][j];
    }


    $("#evolve_button").click(function(){
      var len = selectionList.length;
      if (len === 0) return;

      // AUTO-SAVE: Save all selected parent genomes before mutation
      for (var s = 0; s < len; s++) {
        var selectedIdx = selectionList[s];
        var selectedGenome = getThing(genome, selectedIdx);
        var genomeCopy = selectedGenome.copy();
        genomeCopy.roundWeights();
        var genomeJSON = genomeCopy.toJSON();
        var thumbnailURL = createThumbnailDataURL(genomeCopy, thumbSize);
        historyStorage.save(genomeJSON, thumbnailURL);
      }

      var mom, dad;
      var momGene, dadGene;
      var loc;
      var k, i, j;
      var g;
      var preserveList = R.zeros(nImage);

      for (i=0;i<len;i++) {
        preserveList[selectionList[i]] = 1;
      }
      // mutate and evolve!
      for (k=0;k<nImage;k++) {
        if (preserveList[k] === 0) {
          loc = getPicLoc(k);
          i = loc[0];
          j = loc[1];
          mom = selectionList[R.randi(0, len)];
          dad = selectionList[R.randi(0, len)];
          momGene = getThing(genome, mom);
          dadGene = getThing(genome, dad);


          if (mom === dad) {
            genome[i][j] = momGene.copy();
          } else {
            genome[i][j] = momGene.crossover(dadGene);
          }

          genome[i][j].mutateWeights();
          if (Math.random() < 0.5) genome[i][j].addRandomNode();
          if (Math.random() < 0.5) {
            genome[i][j].addRandomConnection();
          }

          genome[i][j].roundWeights();
          thumb[i][j] = NetArt.genGenomeImage(genome[i][j], thumbSize, thumbSize);
          drawThumb(i, j);
        }
      }

      // clear selection list
      selectionList = [];

      // redraw selection boxes
      updateSelected();

    });
    $("#zoom_selected_button").click(function(){
      console.log(lastSelected);
      if (lastSelected < 0) return;
      currSelected = lastSelected;
    });
    
    
    $("#zoom_selected_button").hide();


    function mainScreen() {
      clearSelection();
      //RenderGraph.removeSVG();
      $("#secondScreenWarning").text("");
      $("#neurogram_description").val("");
      $("#secondScreen").hide();
      $("#galleryScreen").hide();
      $("#loadScreen").hide();
      $("#mainScreen").show();
    }

    $("#back_button").click(function(){
      mainScreen();
    });

    $("#secondScreenWarning").css({
        "color": "#EE5C44"
        });

    $("#save_png_button").click(function(){
      var fileName = "picbreeder.png";

      $("#secondScreenWarning").text("saved as '"+fileName+"'.");
      document.getElementById("save_png_button").download = fileName;
      document.getElementById("save_png_button").href = canvas2.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    });


    function main() {
      // start of the program
      var loadedGenomeData = sessionStorage.getItem('picbreeder_load_genome');
      if (loadedGenomeData) {
        sessionStorage.removeItem('picbreeder_load_genome');
        try {
          var genomeData = JSON.parse(loadedGenomeData);

          initAll();

          // Set render mode from loaded data
          N.setRenderMode(genomeData.renderMode || 0);

          // Create a new genome and load the saved data
          var loadedGenome = new N.Genome();
          loadedGenome.fromJSON(genomeData);

          // Place loaded genome in center of grid (position 2,2 in 5x5 grid)
          genome[2][2] = loadedGenome;

          // Fill rest of grid with mutations of the loaded genome
          for (var i = 0; i < nRow; i++) {
            for (var j = 0; j < nCol; j++) {
              if (i !== 2 || j !== 2) {
                genome[i][j] = loadedGenome.copy();
                genome[i][j].mutateWeights();
                if (Math.random() < 0.5) genome[i][j].addRandomNode();
                if (Math.random() < 0.5) genome[i][j].addRandomConnection();
              }
            }
          }

          initThumb();
          drawAllThumb();
          $("#mainScreen").show();

          // Auto-select the center loaded genome
          selectionList = [12];
          updateSelected();

          return;
        } catch (e) {
          console.error('Error loading genome:', e);
        }
      }

      // Normal initialization
      initAll();
      initGenome();
      initThumb();
      drawAllThumb();
      $("#mainScreen").show();

    }
    /* eslint-enable no-unused-vars */
    

    //lets go!
    main();
  }    
}

</script>



<style scoped>


@font-face {
  font-family:"pencil";
  src: ("../lib/pencil.tff"); /*TTF file for CSS3 browsers*/
}

body {
    margin: 0;
    overflow-x: hidden;
    font-family: "pencil","Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 200;
    display: hidden;
}

.col-fixed-405{
    width:405px;
    height:100%;
    margin: auto;
}

.col-fixed-10{
    width:20px;
    height:100%;
    margin: left;
}

.col-fixed-640{
    width:640px;
    height:100%;
    margin: auto;
}

.col-90{
    width:90%;
    height:100%;
    margin: auto;
}

.container{
    max-width: 450px;
}

.otoroLink {
    font-family: "Helvetica Neue", Arial;
    font-weight: 100;
    font-size: 1.0em;
    opacity: 0.5;
}

.btn {
    font-family: "pencil", "Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 300;
    font-size: 1.00em;
}

.borderless tbody tr td, .borderless thead tr th {
    border: none;
}

.floating-label-form-group {
    position: relative;
    margin-bottom: 0;
    padding-bottom: .5em;
    border-bottom: 1px solid #eee;
}

.floating-label-form-group input,
.floating-label-form-group textarea {
    z-index: 1;
    position: relative;
    padding-right: 0;
    padding-left: 0;
    border: 0;
    border-radius: 0;
    font-size: 1.0em;
    background: 0 0;
    box-shadow: none!important;
    resize: none;
}

.floating-label-form-group label {
    display: block;
    z-index: 0;
    position: relative;
    top: 2em;
    margin: 0;
    font-size: .85em;
    line-height: 1.764705882em;
    /* vertical-align: middle; */
    /* vertical-align: baseline; */
    opacity: 0;
    -webkit-transition: top .3s ease,opacity .3s ease;
    -moz-transition: top .3s ease,opacity .3s ease;
    -ms-transition: top .3s ease,opacity .3s ease;
    transition: top .3s ease,opacity .3s ease;
}

.floating-label-form-group::not(:first-child) {
    padding-left: 14px;
    border-left: 1px solid #eee;
}

.floating-label-form-group-with-value label {
    top: 0;
    opacity: 1;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 200;
}

.floating-label-form-group-with-focus label {
    color: #f4b40d;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 200;
}

form .row:first-child .floating-label-form-group {
    border-top: 1px solid #eee;
}

.form-control-inline {
    min-width: 0;
    border: none;
    /* width: auto; */
    display: inline;
}

.html .value,
.javascript .string,
.javascript .regexp {
  color: #756bb1;
}

.html .tag,
.css .tag,
.javascript .keyword {
  color: #3182bd;
}

.comment {
  color: #636363;
}

.html .doctype,
.javascript .number {
  color: #31a354;
}

.html .attribute,
.css .attribute,
.javascript .class,
.javascript .special {
  color: #e6550d;
}

svg {
  font: 10px sans-serif;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

#imagePlane {
  cursor: pointer;
}

.node {
  stroke: #fff;
  stroke-width: 1.5px;
    cursor: move;
}

.link {
  fill: none;
  stroke: #000;
  stroke-width: 1.5px;
  opacity: 0.4;
  marker-end: url(#end-arrow);
}

.label {
    fill: white;
    font-family: Verdana;
    font-size: 25px;
    text-anchor: middle;
    cursor: move;
}

#portfolio .portfolio-item {
    right: 0;
    margin: 0 0 15px;
}

#portfolio .portfolio-item .portfolio-link {
    display: block;
    position: relative;
    margin: 0 auto;
    max-width: 150;
    max-height: 150;
}

#portfolio .portfolio-item .portfolio-link .caption {
    position: absolute;
    width: 110%;
    height: 110%;
    opacity: 0;
    background: rgba(255,255,255,.65); 
    -webkit-transition: all ease .5s;
    -moz-transition: all ease .5s;
    transition: all ease .5s;
}

#portfolio .portfolio-item .portfolio-link .caption:hover {
    opacity: 1;
}

#portfolio .portfolio-item .portfolio-link .caption .caption-content {
    position: absolute;
    top: 25%;
    width: 100%;
    height: 15px;
    margin-top: -12px;
    text-align: center;
    font-size: 1em;
    color: #000;
}

#portfolio .portfolio-item .portfolio-link .caption .caption-content i {
    margin-top: -12px;
}

#portfolio .portfolio-item .portfolio-link .caption .caption-content h3,
#portfolio .portfolio-item .portfolio-link .caption .caption-content h4 {
    margin: 0;
}

#portfolio * {
    z-index: 2;
}

@media(min-width:300) {
    #portfolio .portfolio-item {
        margin: 0 0 15px;
    }
}

.portfolio-modal .modal-content {
    padding: 100px 0;
    min-height: 100%;
    border: 0;
    border-radius: 0;
    text-align: center;
    background-clip: border-box;
    -webkit-box-shadow: none;
    box-shadow: none;
}

.portfolio-modal .modal-content h2 {
    margin: 0;
    font-size: 3em;
}

.portfolio-modal .modal-content img {
    margin-bottom: 30px;
}

.portfolio-modal .modal-content .item-details {
    margin: 30px 0;
}

.portfolio-modal .close-modal {
    position: absolute;
    top: 25px;
    right: 25px;
    width: 75px;
    height: 75px;
    background-color: transparent;
    cursor: pointer;
}

.portfolio-modal .close-modal:hover {
    opacity: .3;
}

.portfolio-modal .close-modal .lr {
    z-index: 1051;
    width: 1px;
    height: 75px;
    margin-left: 35px;
    background-color: #2c3e50;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
}

.portfolio-modal .close-modal .lr .rl {
    z-index: 1052;
    width: 1px;
    height: 75px;
    background-color: #2c3e50;
    -webkit-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
}

.portfolio-modal .modal-backdrop {
    display: none;
    opacity: 0;
}

.row {
    justify-content: center;
    flex-direction: column;
}


</style>