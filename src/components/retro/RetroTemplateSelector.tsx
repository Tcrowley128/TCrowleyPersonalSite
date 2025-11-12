"use client";

import { motion } from "framer-motion";
import { RETRO_TEMPLATES, RetroTemplate } from "@/lib/retro-templates";
import { Check } from "lucide-react";

interface RetroTemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export default function RetroTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: RetroTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {RETRO_TEMPLATES.map((template) => {
        const isSelected = selectedTemplate === template.id;

        return (
          <motion.button
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{template.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {template.columns.map((column) => (
                <div
                  key={column.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${column.color}`}
                >
                  {column.emoji} {column.title}
                </div>
              ))}
            </div>

            {template.votingEnabled && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Voting enabled • Max {template.maxVotesPerPerson} votes per person
                </p>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
