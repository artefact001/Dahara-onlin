<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use Illuminate\Http\Request;

/**
 * Test de positionnement simple (20 questions dans le cahier des charges original) :
 * ici réduit à un jeu de questions représentatif, mais la logique de notation
 * est la même — à enrichir avec de vraies questions pédagogiques plus tard.
 */
class PlacementQuizController extends Controller
{
    // GET /api/placement-quiz/questions - public (avant même inscription si besoin)
    public function questions()
    {
        return response()->json($this->quizBank());
    }

    // POST /api/placement-quiz/submit (auth) - { answers: [{ question_id, answer_index }] }
    public function submit(Request $request, GamificationService $gamification)
    {
        $data = $request->validate([
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer_index' => 'required|integer|min:0',
        ]);

        $bank = collect($this->quizBank())->keyBy('id');
        $score = 0;

        foreach ($data['answers'] as $answer) {
            $question = $bank->get($answer['question_id']);
            if ($question && $answer['answer_index'] === $question['correct_index']) {
                $score++;
            }
        }

        $total = $bank->count();
        $percent = $total > 0 ? ($score / $total) * 100 : 0;

        $level = match (true) {
            $percent >= 75 => 'avance',
            $percent >= 40 => 'intermediaire',
            default => 'debutant',
        };

        $request->user()->update(['placement_level' => $level]);
        $gamification->awardPoints($request->user(), 5, 'Test de positionnement complété');

        return response()->json(['score' => $score, 'total' => $total, 'level' => $level]);
    }

    private function quizBank(): array
    {
        return [
            ['id' => 1, 'question' => 'Combien de lettres compte l\'alphabet arabe ?', 'options' => ['26', '28', '30', '32'], 'correct_index' => 1],
            ['id' => 2, 'question' => 'Que signifie "tajwid" ?', 'options' => ['La traduction', 'L\'art de la belle récitation', 'Le jeûne', 'La prière'], 'correct_index' => 1],
            ['id' => 3, 'question' => 'Quelle est la première sourate du Coran ?', 'options' => ['Al-Baqara', 'Al-Ikhlas', 'Al-Fatiha', 'An-Nas'], 'correct_index' => 2],
            ['id' => 4, 'question' => 'Combien de temps dure un allongement (madd) naturel ?', 'options' => ['1 temps', '2 temps', '4 temps', '6 temps'], 'correct_index' => 1],
            ['id' => 5, 'question' => 'Que veut dire "Bismillah" ?', 'options' => ['Louange à Dieu', 'Au nom de Dieu', 'Dieu est grand', 'Il n\'y a de dieu que Dieu'], 'correct_index' => 1],
        ];
    }
}
