import { Component, Vue } from "vue-property-decorator";
import { Button } from 'iview';
import { routerConfig } from './router';

@Component
export default class App extends Vue {
    render() {
        return (
            <div>
                <router-link to={routerConfig.index.path}>
                    <Button>{routerConfig.index.text}</Button>
                </router-link>
                <router-link to={routerConfig.dynamicCdn.path}>
                    <Button>{routerConfig.dynamicCdn.text}</Button>
                </router-link>
                <router-link to={routerConfig.dynamicCdn2.path}>
                    <Button>{routerConfig.dynamicCdn2.text}</Button>
                </router-link>
                <router-view></router-view>
            </div>
        );
    }
}