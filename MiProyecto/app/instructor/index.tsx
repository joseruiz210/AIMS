import { Redirect } from 'expo-router';

export default function InstructorIndex() {
  return <Redirect href={'/instructor/inicio' as any} />;
}
