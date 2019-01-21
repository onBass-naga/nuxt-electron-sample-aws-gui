<template>
  <div v-if="visible">
    <el-dialog title="New profile" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="Profile" :label-width="formLabelWidth">
          <el-input v-model="form.profile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveProfile">Add</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>
  div {
    margin: 10px;
  }
</style>

<script>
  import fs from 'fs'
  import {Howl} from 'howler';

  export default {
    props: ['visible', 'filePath', 'onClose'],
    data() {
      return {
        dialogVisible: true,
        dialogTableVisible: false,
        dialogFormVisible: false,
        form: {
          profile: ''
        },
        formLabelWidth: '120px',
        playing: false,
        recSound: null,
        recorder: null,
        chunks: []
      };
    },
    mounted: function() {

    },
    computed: {
      // dialogVisible: function() {
      //   return this.visible
      // }
    },
    methods: {
      handleRec() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

        navigator.getUserMedia({
          audio: true,
          video: false
        }, successFunc, errorFunc);

        this.chunks = []

        const self = this
        function successFunc(stream) {
          self.recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
          })

          self.recorder.addEventListener('dataavailable', function(ele) {
            if (ele.data.size > 0) {
              self.chunks.push(ele.data);
            }
          });

          self.recorder.addEventListener('stop', function() {
            self.recSound = URL.createObjectURL(new Blob(self.chunks));
          });

          self.recorder.start();
        }

        function errorFunc(error) {
          alert("error");
        }
      },
      stopRecording() {
        this.recorder.stop();
      },
      handlePlay() {
        try {
          if (this.playing) { return }

          this.playing = true

          const buffer = fs.readFileSync(this.filePath);
          const base64 = buffer.toString('base64');

          const sound = new Howl({
            src: [`data:audio/mp3;base64,${base64}`],
            volume: 0.5,
            onend: () => {
              this.playing = false
            }
          });

          sound.play()

        } catch (ex) {
          console.log("error: " + ex)
        }
      },
      onClosed() {
        this.$emit('onClosed')
        this.dialogVisible = true
      },
      speechToText() {
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

        var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
        var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'

        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
//recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
          var last = event.results.length - 1;
          var color = event.results[last][0].transcript;
          console.log('color: ' + color);
          // diagnostic.textContent = 'Result received: ' + color + '.';
          console.log('Confidence: ' + event.results[0][0].confidence);
        }

        recognition.onspeechend = function() {
          recognition.stop();
        }

        recognition.onnomatch = function(event) {
          // diagnostic.textContent = "I didn't recognise that color.";
          console.log("I didn't recognise that color.")
        }

        recognition.onerror = function(event) {
          // diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
          console.log('Error occurred in recognition: ' + event.error)
        }

        recognition.start();

        setTimeout(() => {
          recognition.stop();
        }, 10000)
      }
    }
  }
</script>
