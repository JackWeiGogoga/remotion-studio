import "./index.css";
import { Composition } from "remotion";

const BlankCanvas = () => null;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BlankCanvas"
      component={BlankCanvas}
      durationInFrames={60}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
