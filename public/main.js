window.onload = init;

var badHeaderException = "Bad File Header. File is either not a midi file or unsupported. Get in contact if you get this message for a valid midi file"
var outOfRangeException = "Notes in this midi file are out of the supported range. <br> Keep Notes on the white notes between C1-C3"

var timeScale = 0.05;
var noteStart = 60;
var notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

var marginWidth = (1/2)*72;
var gutterWidth = (9/32)*72;
var noteWidth = (2.5/32)*72;
var holeGap = (3/32)*72;
var staffWidth;
var paperHeight = 11*72;
var paperWidth  = 8.5*72;

function init(){
    var x = document.getElementById('loader')
    console.log(x)
    x.addEventListener('change', readSingleFile, false)
}

function readSingleFile(e) {

  var file = e.target.files[0];

  if (!file) {
    return
  }

  var reader = new FileReader();

  reader.onload = function(e) {

    var success = true;
    var logit = "";
    try{
      midiToScore(e);
    } catch(err) {
      console.log(err)
      success = false
      logit = err;
    }

    //Remove any previous status messages
    var parent = document.getElementById("error-pane")
    var child = document.getElementById("error")
    if(child != null && parent != null){
      parent.removeChild(child)
    }

    //Display our new status message
    var div = document.createElement("div");
    div.setAttribute('id', 'error-pane');
    if(success){
      div.innerHTML = "<h2>Success!</h2> Your score will download as a PDF. It is recommended to print with thick cardstock";
    } else {
      div.innerHTML = "<h2>Ack!</h2>" + logit
    }
    document.getElementById("error").appendChild(div);

  };

  reader.readAsArrayBuffer(file);

}

function midiToScore(e){

    try{
      var midiFile = new MIDIFile(e.target.result);
    } catch ( err ){
      throw badHeaderException;
    }

      var events = midiFile.getMidiEvents();
      if(events.length === 0){
        throw "No Identifiable midi events in this file"
      }

      doc = new PDFDocument
      var stream = doc.pipe(blobStream());

        var xp = marginWidth;
        var yoff = 0;

        laneHeight = paperHeight - marginWidth * 2 - noteStart;

        staffWidth = 14 * noteWidth;

        //TOP LINE
        doc.moveTo(xp, marginWidth)
         .lineTo(gutterWidth*2 + staffWidth + xp, marginWidth)
         .stroke();

        //Start LINE (START)
        doc.moveTo(xp, marginWidth + noteStart)
         .lineTo(gutterWidth*2 + staffWidth + xp, marginWidth + noteStart)
         .stroke();

        //Left Cut
        doc.moveTo(xp, marginWidth)
         .lineTo(xp, paperHeight-marginWidth)
         .stroke();

        //Note Line
        for(var i = 0; i < 15; ++i){
            doc.moveTo(xp + gutterWidth + noteWidth*i, marginWidth)
             .lineTo(xp + gutterWidth + noteWidth*i, paperHeight-marginWidth);
        }

        //Right Cut
        doc.moveTo(xp + gutterWidth*2+staffWidth,marginWidth)
        .lineTo(xp + gutterWidth*2+staffWidth,paperHeight-marginWidth)
        .stroke();

        //Bottom LINE
        doc.moveTo(xp, paperHeight - marginWidth)
         .lineTo(gutterWidth*2 + staffWidth + xp, paperHeight - marginWidth)
         .stroke();

        var lastY = 0;
        var color_sel = 0;
        while(events.length != 0){

          var _e = events.shift();

          //Skip anything besides note on events
          if(_e.subtype !== MIDIEvents.EVENT_MIDI_NOTE_ON ){
            continue;
          }

          var noteX = midiToScoreSpace(_e.param1) * noteWidth;
          var noteY = ( _e.playTime * timeScale + yoff);

          if(noteX < 0 || noteX > laneWidth){
            throw outOfRangeException;
          }

          if( noteY > (laneHeight)){

            var laneWidth = staffWidth+gutterWidth*2;
            xp += laneWidth;

            if(xp + laneWidth > paperWidth-(marginWidth*2)){
              doc.addPage();
              xp = marginWidth;
            }

            staffWidth = 14 * noteWidth;

            //TOP LINE
            doc.moveTo(xp, marginWidth)
             .lineTo(gutterWidth*2 + staffWidth + xp, marginWidth)
             .stroke();

            //Start LINE (START)
            doc.moveTo(xp, marginWidth + noteStart)
             .lineTo(gutterWidth*2 + staffWidth + xp, marginWidth + noteStart)
             .stroke();

            //Left Cut
            doc.moveTo(xp, marginWidth)
             .lineTo(xp, paperHeight-marginWidth)
             .stroke();

            //Note Line
            for(var i = 0; i < 15; ++i){
                doc.moveTo(xp + gutterWidth + noteWidth*i, marginWidth)
                 .lineTo(xp + gutterWidth + noteWidth*i, paperHeight-marginWidth);
            }

            //Right Cut
            doc.moveTo(xp + gutterWidth*2+staffWidth,marginWidth)
            .lineTo(xp + gutterWidth*2+staffWidth,paperHeight-marginWidth)
            .stroke();

            //Bottom LINE
            doc.moveTo(xp, paperHeight - marginWidth)
             .lineTo(gutterWidth*2 + staffWidth + xp, paperHeight - marginWidth)
             .stroke();

            //yoff scootches things upwards to fit back on the page
            yoff += - laneHeight;
            noteY = ( _e.playTime*timeScale+yoff);
            console.log("Trimmed to " + noteY);
          }
          lastY = noteY;

          if((++color_sel % 2) == 1){
            doc.circle(xp + gutterWidth + noteX , marginWidth + noteY + noteStart, noteWidth/2 ).fill("#FF3500")
          } else {
            doc.circle(xp + gutterWidth + noteX , marginWidth + noteY + noteStart, noteWidth/2 ).fill("#0035FF")
          }

        }
         doc.end()

      stream.on('finish', function() {
          blob = stream.toBlob('application/pdf')
          saveAs(blob, "data.pdf")
          console.log("Saving...")
      });
}

function cmaj(note){
  var scale = {};
  scale["C"]=0;
  scale["D"]=1;
  scale["E"]=2;
  scale["F"]=3;
  scale["G"]=4;
  scale["A"]=5;
  scale["B"]=6;
  return scale[note];
}

function midiToScoreSpace(midi){
  var note = midi;
  var oct = Math.floor(note / 12);
  note -= (oct * 12);
  return ((oct-4)*7) + cmaj(notes[note]);
}
