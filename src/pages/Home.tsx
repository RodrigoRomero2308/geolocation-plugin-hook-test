import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useCurrentLocation } from "../hooks/useLocation";
import "./Home.css";

const Home: React.FC = () => {
  const { currentLocation, start, stop } = useCurrentLocation(2000);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Location Plugin Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="mainContent" style={{ display: "flex" }}>
          <img src="/assets/images/icon.png" alt="" />
          <div className="content">
            <div>Current Location: {JSON.stringify(currentLocation) || ""}</div>
            <button onClick={start}>Start</button>
            <button onClick={stop}>Stop</button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
