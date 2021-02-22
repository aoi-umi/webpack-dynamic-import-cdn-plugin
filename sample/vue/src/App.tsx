import { Component, Vue } from "vue-property-decorator";
import { Button } from 'iview';
import { routerConfig } from './router';

@Component
export default class App extends Vue {
    render() {
        return (
            <div>
                {Object.values(routerConfig).map(ele => {
                    return (
                        <router-link to={ele.path}>
                            <Button>{ele.text}</Button>
                        </router-link>
                    )
                })}
                <router-view></router-view>
            </div>
        );
    }
}