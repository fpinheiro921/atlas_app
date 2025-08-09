import { KB_EXERCISE_LIBRARY } from '../content/knowledgeBase';

export interface ExerciseGuide {
    name: string;
    description: string;
    equipment: string;
    bodyPart: string;
}

const parseExerciseLibrary = (markdown: string): Map<string, ExerciseGuide> => {
    const library = new Map<string, ExerciseGuide>();
    // Split by main equipment sections (e.g., ## I. Bodyweight Exercises)
    const sections = markdown.split('\n## ');

    for (const section of sections) {
        if (!section.trim() || !section.includes('###')) continue;

        const sectionLines = section.split('\n');
        // "I. Bodyweight Exercises" -> "Bodyweight Exercises"
        const equipment = sectionLines[0].trim().replace(/^[IVX]+\. /, ''); 

        // Split by body part sub-sections (e.g., ### Chest)
        const subSections = section.split('\n### ');
        for (const subSection of subSections) {
            if (!subSection.trim() || subSection.startsWith(equipment)) continue;
            
            const subLines = subSection.split('\n');
            const bodyPart = subLines[0].trim();

            for (const line of subLines) {
                 if (line.startsWith('- **')) {
                    // Match pattern: "- **Exercise Name:** Description..."
                    const match = line.match(/- \*\*(.*?):\*\* (.*)/s); // Use 's' flag to match newlines in description if any
                    if (match) {
                        const name = match[1].trim();
                        const description = match[2].trim();
                        if (name && description) {
                            library.set(name.toLowerCase(), {
                                name,
                                description,
                                equipment,
                                bodyPart
                            });
                        }
                    }
                }
            }
        }
    }
    return library;
};


// Memoize the parsed library so it only runs once
const memoizedParse = () => {
    let cache: Map<string, ExerciseGuide> | null = null;
    return () => {
        if (cache === null) {
            cache = parseExerciseLibrary(KB_EXERCISE_LIBRARY);
        }
        return cache;
    };
};

const getExerciseLibrary = memoizedParse();

export const getExerciseGuideByName = (name: string): ExerciseGuide | undefined => {
    const library = getExerciseLibrary();
    // A simple toLowerCase() lookup to handle potential casing differences from the AI.
    return library.get(name.toLowerCase());
};
