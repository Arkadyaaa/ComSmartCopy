import json
import random
from datetime import datetime
from typing import List, Dict, Any, Tuple
from enum import Enum
from pathlib import Path
from dataclasses import dataclass

class BloomLevel(Enum):
    """Bloom's taxonomy levels"""
    KNOWLEDGE = "Knowledge"
    COMPREHENSION = "Comprehension"
    APPLICATION = "Application"
    ANALYSIS = "Analysis"
    SYNTHESIS = "Synthesis"
    EVALUATION = "Evaluation"

class QuestionType(Enum):
    """Question types"""
    MULTIPLE = "multiple"
    FILL = "fill"
    TRUEFALSE = "truefalse"

@dataclass
class ChapterConfig:
    """Configuration for each chapter in summative assessment"""
    chapter_id: str
    question_count: int
    time_frame_hours: int
    percentage: float
    bloom_distribution: Dict[str, float]

class AssessmentRule:
    """Base rule for assessment generation"""
    def __init__(self, name: str):
        self.name = name
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        raise NotImplementedError

class BloomDistributionRule(AssessmentRule):
    """Ensures proper distribution of Bloom's levels with tolerance"""
    def __init__(self, target_distribution: Dict[str, float], tolerance: float = 0.12):
        super().__init__("BloomDistribution")
        self.target_distribution = target_distribution
        self.tolerance = tolerance
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        if not questions:
            return False, "No questions provided"
        
        bloom_counts = {}
        for q in questions:
            bloom = q.get('bloom', 'Unknown')
            bloom_counts[bloom] = bloom_counts.get(bloom, 0) + 1
        
        total = len(questions)
        violations = []
        
        for bloom, target_ratio in self.target_distribution.items():
            actual_count = bloom_counts.get(bloom, 0)
            actual_ratio = actual_count / total if total > 0 else 0
            
            if abs(actual_ratio - target_ratio) > self.tolerance:
                violations.append(
                    f"{bloom}: expected {target_ratio*100:.1f}%, got {actual_ratio*100:.1f}%"
                )
        
        if violations:
            return False, f"Bloom distribution mismatch: {'; '.join(violations)}"
        return True, "Bloom distribution valid"

class QuestionTypeBalanceRule(AssessmentRule):
    """Ensures variety in question types"""
    def __init__(self, min_variety: float = 0.15):
        super().__init__("QuestionTypeBalance")
        self.min_variety = min_variety
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        if not questions:
            return False, "No questions provided"
        
        type_counts = {}
        for q in questions:
            q_type = q.get('type', 'unknown')
            type_counts[q_type] = type_counts.get(q_type, 0) + 1
        
        total = len(questions)
        max_single_type = max(type_counts.values()) if type_counts else 0
        max_ratio = max_single_type / total if total > 0 else 0
        
        if max_ratio > (1 - self.min_variety):
            return False, f"Question type imbalance: {max_ratio*100:.1f}% of single type"
        return True, "Question type balance valid"

class NoDuplicateRule(AssessmentRule):
    """Ensures no duplicate questions"""
    def __init__(self):
        super().__init__("NoDuplicate")
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        question_texts = [q.get('question', '') for q in questions]
        if len(question_texts) != len(set(question_texts)):
            return False, "Duplicate questions found"
        return True, "No duplicates found"

class TimeFrameRule(AssessmentRule):
    """Validates assessment difficulty matches time frame"""
    def __init__(self, hours: int, margin: float = 0.85):
        super().__init__("TimeFrame")
        self.hours = hours
        self.margin = margin
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        estimated_time = self._calculate_time(questions)
        max_allowed_minutes = self.hours * 60 * self.margin
        
        if estimated_time > max_allowed_minutes:
            return False, f"Time estimate {estimated_time:.0f}min exceeds {max_allowed_minutes:.0f}min"
        return True, f"Time estimate {estimated_time:.0f}min within limit"
    
    def _calculate_time(self, questions: List[Dict]) -> float:
        """Calculate estimated time in minutes"""
        estimated_time = 0
        for q in questions:
            bloom = q.get('bloom', 'Knowledge')
            q_type = q.get('type', 'multiple')
            
            base_time = {
                'multiple': 2.0,
                'fill': 2.5,
                'truefalse': 1.0
            }.get(q_type, 2.0)
            
            bloom_multiplier = {
                'Knowledge': 1.0,
                'Comprehension': 1.2,
                'Application': 1.5,
                'Analysis': 2.0,
                'Synthesis': 2.5,
                'Evaluation': 3.0
            }.get(bloom, 1.0)
            
            estimated_time += base_time * bloom_multiplier
        
        return estimated_time

class DifficultyProgressionRule(AssessmentRule):
    """Ensures questions progress from easy to difficult"""
    def __init__(self):
        super().__init__("DifficultyProgression")
    
    def evaluate(self, questions: List[Dict], context: Dict) -> Tuple[bool, str]:
        if not questions:
            return False, "No questions provided"
        
        bloom_order = ['Knowledge', 'Comprehension', 'Application', 'Analysis', 'Synthesis', 'Evaluation']
        bloom_values = [bloom_order.index(q.get('bloom', 'Knowledge')) for q in questions]
        
        increasing_count = sum(1 for i in range(len(bloom_values)-1) if bloom_values[i] <= bloom_values[i+1])
        increasing_ratio = increasing_count / (len(bloom_values) - 1) if len(bloom_values) > 1 else 1
        
        if increasing_ratio >= 0.6:
            return True, f"Difficulty progression valid ({increasing_ratio*100:.0f}% non-decreasing)"
        return False, f"Insufficient difficulty progression ({increasing_ratio*100:.0f}%)"

class SummativeAssessmentGenerator:
    """Rule-based system for generating ONE unified summative assessment"""
    
    # Configuration for unified summative exam
    SUMMATIVE_CONFIG = {
        'chapter1': ChapterConfig(
            chapter_id='chapter1',
            question_count=20,
            time_frame_hours=50,
            percentage=25.25,
            bloom_distribution={
                'Knowledge': 0.30,
                'Comprehension': 0.25,
                'Application': 0.20,
                'Analysis': 0.15,
                'Synthesis': 0.05,
                'Evaluation': 0.05
            }
        ),
        'chapter2': ChapterConfig(
            chapter_id='chapter2',
            question_count=18,
            time_frame_hours=50,
            percentage=20.20,
            bloom_distribution={
                'Knowledge': 0.35,
                'Comprehension': 0.28,
                'Application': 0.18,
                'Analysis': 0.12,
                'Synthesis': 0.04,
                'Evaluation': 0.03
            }
        ),
        'chapter3': ChapterConfig(
            chapter_id='chapter3',
            question_count=12,
            time_frame_hours=50,
            percentage=15.15,
            bloom_distribution={
                'Knowledge': 0.25,
                'Comprehension': 0.20,
                'Application': 0.15,
                'Analysis': 0.25,
                'Synthesis': 0.10,
                'Evaluation': 0.05
            }
        )
    }
    
    def __init__(self, question_bank_path: str = None):
        self.question_bank = {}
        self.load_question_bank(question_bank_path)
    
    def load_question_bank(self, base_path: str = None):
        """Load all question bank files"""
        if base_path is None:
            base_path = r"c:\Users\domet\Desktop\comsmart\ComSmart\assets\question_bank"
        
        base_path = Path(base_path)
        
        # Map file names to chapter IDs
        file_mapping = {
            'chapter_1_Bloom.json': 'chapter1',
            'chapter_2_Bloom.json': 'chapter2',
            'chapter_3_Bloom.json': 'chapter3'
        }
        
        files_found = 0
        for file_name, chapter_id in file_mapping.items():
            file_path = base_path / file_name
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    questions = json.load(f)
                    valid_questions = [
                        q for q in questions 
                        if all(k in q for k in ['question', 'type', 'bloom', 'answer'])
                        and q.get('question', '').strip()
                    ]
                    self.question_bank[chapter_id] = valid_questions
                    files_found += 1
            except (FileNotFoundError, json.JSONDecodeError):
                self.question_bank[chapter_id] = []
                

    def _get_rules_for_assessment(self) -> List[AssessmentRule]:
        """Get rules for unified assessment"""
        return [
            NoDuplicateRule(),
            QuestionTypeBalanceRule(min_variety=0.15),
            TimeFrameRule(150, margin=0.90),  
            DifficultyProgressionRule()
        ]
    
    def select_questions_with_rules(self, chapter: str, config: ChapterConfig) -> Tuple[List[Dict], Dict]:
        """Select questions that satisfy rules for a specific chapter"""
        available_questions = self.question_bank.get(chapter, [])
        
        if len(available_questions) < config.question_count:
            return available_questions, {'warnings': f'Insufficient questions'}
        
        rules = self._get_rules_for_assessment()
        context = {'chapter': chapter, 'hours': config.time_frame_hours}
        
        max_attempts = 100
        best_selection = None
        best_score = -1
        
        for attempt in range(max_attempts):
            selected = self._stratified_sample(
                available_questions,
                config.question_count,
                config.bloom_distribution
            )
            
            selected = sorted(selected, key=lambda x: self._bloom_difficulty(x.get('bloom', 'Knowledge')))
            
            violation_count = 0
            for rule in rules:
                passes, _ = rule.evaluate(selected, context)
                if not passes:
                    violation_count += 1
            
            score = -violation_count
            if score > best_score:
                best_score = score
                best_selection = selected
            
            if violation_count == 0:
                return selected, {'attempts': attempt + 1, 'violations': 0}
        
        return best_selection, {
            'attempts': max_attempts,
            'violations': -best_score
        }
    
    def _stratified_sample(self, questions: List[Dict], target_count: int, 
                          bloom_distribution: Dict[str, float]) -> List[Dict]:
        """Sample questions maintaining Bloom distribution"""
        bloom_groups = {}
        for q in questions:
            bloom = q.get('bloom', 'Knowledge')
            if bloom not in bloom_groups:
                bloom_groups[bloom] = []
            bloom_groups[bloom].append(q)
        
        selected = []
        for bloom, target_ratio in bloom_distribution.items():
            target_count_for_bloom = round(target_count * target_ratio)
            available = bloom_groups.get(bloom, [])
            
            if available:
                sampled = random.sample(
                    available,
                    min(target_count_for_bloom, len(available))
                )
                selected.extend(sampled)
        
        if len(selected) < target_count:
            remaining = [q for q in questions if q not in selected]
            additional = random.sample(
                remaining,
                min(target_count - len(selected), len(remaining))
            )
            selected.extend(additional)
        
        return selected[:target_count]
    
    def _bloom_difficulty(self, bloom: str) -> int:
        """Get difficulty order of Bloom level"""
        order = {
            'Knowledge': 0,
            'Comprehension': 1,
            'Application': 2,
            'Analysis': 3,
            'Synthesis': 4,
            'Evaluation': 5
        }
        return order.get(bloom, 0)
    
    def generate_unified_assessment(self) -> Dict[str, Any]:
        """Generate ONE unified summative assessment with all chapters"""
        all_questions = []
        chapter_selections = {}
        total_marks = 0
        
        for chapter, config in self.SUMMATIVE_CONFIG.items():
            available_questions = self.question_bank.get(chapter, [])
            
            if not available_questions:
                continue
            
            shuffled_questions = available_questions.copy()
            random.shuffle(shuffled_questions)
            selected_questions = shuffled_questions[:config.question_count]
            
            if selected_questions:
                all_questions.extend(selected_questions)
                chapter_selections[chapter] = {
                    'count': len(selected_questions),
                    'statistics': self._calculate_chapter_stats(selected_questions)
                }
                total_marks += len(selected_questions)
        
        all_questions = sorted(all_questions, key=lambda x: self._bloom_difficulty(x.get('bloom', 'Knowledge')))
        
        overall_stats = self._calculate_statistics(all_questions)
        
        assessment = {
            'metadata': {
                'id': f"summative_assessment_{datetime.now().strftime('%Y%m%d_%H%M%S%f')}",
                'title': 'Comprehensive Summative Assessment',
                'assessment_type': 'Unified',
                'created_at': datetime.now().isoformat(),
                'total_questions': len(all_questions),
                'total_marks': total_marks,
                'timeframe_hours': 150,
                'estimated_duration_hours': 2.5,
                'chapters_included': list(self.SUMMATIVE_CONFIG.keys())
            },
            'chapter_breakdown': chapter_selections,
            'questions': all_questions,
            'statistics': overall_stats
        }
        
        return assessment
    
    def save_assessment(self, assessment: Dict, output_path: str = None):
        """Save unified assessment to JSON file"""
        if output_path is None:
            output_path = r"c:\Users\domet\Desktop\comsmart\ComSmart\compute_tos"
        
        output_path = Path(output_path)
        output_path.mkdir(parents=True, exist_ok=True)
        
        file_path = output_path / "summative_assessment.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(assessment, f, indent=2, ensure_ascii=False)

    def generate_report(self, assessment: Dict) -> str:
        """Generate comprehensive assessment report"""
        report = []
        report.append("\n" + "="*70)
        report.append("UNIFIED SUMMATIVE ASSESSMENT REPORT")
        report.append("="*70)
        
        metadata = assessment['metadata']
        report.append(f"\n Assessment ID: {metadata['id']}")
        report.append(f"   Created: {metadata['created_at']}")
        report.append(f"   Type: {metadata['assessment_type']}")
        
        report.append(f"\n OVERVIEW")
        report.append(f"   Total Questions: {metadata['total_questions']}")
        report.append(f"   Total Marks: {metadata['total_marks']}")
        
        return "\n".join(report)

    def _calculate_statistics(self, questions: List[Dict]) -> Dict[str, Any]:
        """Calculate comprehensive assessment statistics"""
        bloom_distribution = {}
        type_distribution = {}
        
        time_rule = TimeFrameRule(150)
        
        for q in questions:
            bloom = q.get('bloom', 'Unknown')
            q_type = q.get('type', 'unknown')
            
            bloom_distribution[bloom] = bloom_distribution.get(bloom, 0) + 1
            type_distribution[q_type] = type_distribution.get(q_type, 0) + 1
        
        estimated_time = time_rule._calculate_time(questions)
        
        total = len(questions)
        bloom_percentage = {k: round((v/total)*100, 2) for k, v in bloom_distribution.items()} if total > 0 else {}
        type_percentage = {k: round((v/total)*100, 2) for k, v in type_distribution.items()} if total > 0 else {}
        
        return {
            'bloom_distribution': bloom_distribution,
            'bloom_percentage': bloom_percentage,
            'type_distribution': type_distribution,
            'type_percentage': type_percentage,
            'total_questions': total,
            'estimated_duration_minutes': round(estimated_time, 2),
            'estimated_duration_hours': round(estimated_time / 60, 2)
        }

    def _calculate_chapter_stats(self, questions: List[Dict]) -> Dict:
        """Calculate statistics for a chapter"""
        bloom_dist = {}
        type_dist = {}
        
        for q in questions:
            bloom = q.get('bloom', 'Unknown')
            q_type = q.get('type', 'unknown')
            bloom_dist[bloom] = bloom_dist.get(bloom, 0) + 1
            type_dist[q_type] = type_dist.get(q_type, 0) + 1
        
        total = len(questions)
        return {
            'bloom_distribution': bloom_dist,
            'type_distribution': type_dist
        }

def generate_summative_assessment() -> Dict[str, Any]:
    """Standalone function to generate and return summative assessment"""
    try:
        generator = SummativeAssessmentGenerator()
        return generator.generate_unified_assessment()
    except Exception as e:
        return {
            'error': str(e),
            'metadata': {
                'id': f"summative_assessment_error_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'title': 'Assessment Generation Error',
                'assessment_type': 'Error',
                'created_at': datetime.now().isoformat(),
                'total_questions': 0
            },
            'questions': []
        }

def main():
    """Main execution"""
    generator = SummativeAssessmentGenerator()
    assessment = generator.generate_unified_assessment()
    generator.save_assessment(assessment)

if __name__ == "__main__":
    main()