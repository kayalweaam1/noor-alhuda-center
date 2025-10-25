import { trpc } from "@/lib/trpc";

export default function WelcomeMessage() {
  const { data: settings } = trpc.appSettings.get.useQuery();

  if (!settings?.welcomeMessage) {
    return null;
  }

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-sm animate-fade-in">
      <div className="text-center">
        <div className="inline-block">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 text-emerald-300 text-4xl opacity-50">❝</div>
            <div className="absolute -bottom-4 -left-4 text-emerald-300 text-4xl opacity-50">❞</div>
            
            {/* Message text */}
            <p className="text-xl md:text-2xl font-semibold text-emerald-900 leading-relaxed px-8 py-4">
              {settings.welcomeMessage}
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative border */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300"></div>
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300"></div>
      </div>
    </div>
  );
}
