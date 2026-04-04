import type { NextPage } from 'next';
import styles from '../src/styles/Home.module.css';
import ColorPicker from '../src/components/ColorPicker';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <ColorPicker />
    </div>
  );
};

export default Home;
