import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir a la pantalla de bienvenida / login por defecto
  return <Redirect href={"/(auth)" as any} />;
}
