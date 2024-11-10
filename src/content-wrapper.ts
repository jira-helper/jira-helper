import { isJira } from './shared/utils';
import './shared/components/styles.css';
/**
 * TODO: docs
 */
function main() {
  if (isJira) {
    import('./content');
  }
}

main();
