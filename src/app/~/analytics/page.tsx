import { Layout } from "@/components/dashboard/layout";
import { ComingSoonContent } from "@/components/dashboard/coming-soon-content";

export default function Analytics() {
  return (
    <Layout>
      <ComingSoonContent
        title="Performance Analytics"
        description="Exciting analytics features are on the way! We're developing tools to help you visualize and improve your handstand performance."
      />
    </Layout>
  );
}
