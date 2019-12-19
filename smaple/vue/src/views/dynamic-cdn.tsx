import { Component, Vue } from "vue-property-decorator";
import videojs from 'video.js';
import 'video.js/dist/video-js.min.css';

@Component
export default class DynamicCdn extends Vue {

    $refs: { video: HTMLVideoElement; };

    mounted() {
        videojs(this.$refs.video, {
            controls: true,
            language: 'en',
            aspectRatio: '16:9',
            nativeControlsForTouch: false,
        });
    }

    render() {
        return <video ref="video" class="video-js vjs-default-skin vjs-big-play-centered"/>;
    }
}