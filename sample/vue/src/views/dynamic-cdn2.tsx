import { Component, Vue } from "vue-property-decorator";

import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

@Component({
    quillEditor,
})
export default class DynamicCdn extends Vue {

    $refs: { video: HTMLVideoElement; };

    mounted() {
    }

    render() {
        return <quillEditor />;
    }
}