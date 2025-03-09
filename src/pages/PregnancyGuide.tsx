import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

interface WeekGuide {
  title: string;
  description: string;
  milestones: string[];
}

export default function PregnancyGuide() {
  const { t } = useTranslation();
  const [selectedTrimester, setSelectedTrimester] = useState<1 | 2 | 3>(1);

  const trimesters = {
    1: Array.from({ length: 13 }, (_, i) => i + 1),
    2: Array.from({ length: 14 }, (_, i) => i + 14),
    3: Array.from({ length: 15 }, (_, i) => i + 28)
  };

  const weekGuides: Record<number, WeekGuide> = {
    1: {
      title: "Getting Started",
      description: "While you're not technically pregnant yet, your body is preparing for conception.",
      milestones: ["Menstrual period begins", "Ovulation occurs", "Possible conception"]
    },
    4: {
      title: "Early Development",
      description: "Your baby is now the size of a poppy seed. The amniotic sac and fluid are forming around the embryo.",
      milestones: ["Implantation occurs", "Pregnancy hormone (hCG) starts being produced", "Early pregnancy symptoms may begin"]
    },
    8: {
      title: "Major Development",
      description: "Your baby is now the size of a raspberry. Major organs and structures are forming.",
      milestones: ["Baby's heart begins to beat", "Neural tube develops", "Tiny limb buds appear"]
    },
    // Add more weeks as needed
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pregnancy Week by Week
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Track your pregnancy journey with our comprehensive week-by-week guide. Learn about your baby's development
            and what changes to expect in your body.
          </p>
        </div>
      </div>

      {/* Trimester Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[1, 2, 3].map((trimester) => (
              <button
                key={trimester}
                onClick={() => setSelectedTrimester(trimester as 1 | 2 | 3)}
                className={`py-4 px-6 font-medium text-lg relative ${
                  selectedTrimester === trimester
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(`Trimester ${trimester}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trimesters[selectedTrimester].map((week) => (
            <div
              key={week}
              className="bg-white rounded-lg border hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Week {week}
                  </h3>
                  {weekGuides[week] && (
                    <>
                      <h4 className="text-primary-600 font-medium mb-3">
                        {weekGuides[week].title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {weekGuides[week].description}
                      </p>
                      <ul className="space-y-2">
                        {weekGuides[week].milestones.map((milestone, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <ChevronRight className="h-4 w-4 text-primary-500 mr-2" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 