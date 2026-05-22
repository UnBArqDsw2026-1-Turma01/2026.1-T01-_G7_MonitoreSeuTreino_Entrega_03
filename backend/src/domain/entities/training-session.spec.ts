import { ExerciseNode } from './exercise-node';
import { TrainingSet } from './training-set';
import { TrainingSessionBuilder } from '../builders/training-session.builder';
import { TrainingSetIterator } from '../iterators/training-set.iterator';

describe('Workout Session Domain Modules (Builder, Composite, Iterator)', () => {
  const userId = 'user-uuid-123';
  const exerciseId = 'exercise-uuid-abc';

  describe('Builder Pattern - TrainingSessionBuilder', () => {
    it('should build a valid TrainingSession with correct details', () => {
      const date = new Date('2026-05-20T10:00:00Z');
      const routineId = 'routine-uuid-456';

      const session = new TrainingSessionBuilder(userId)
        .withDate(date)
        .withRoutine(routineId)
        .addExercise(exerciseId, 3, 'node-1')
        .addSetToExercise('node-1', 10, 10, 50)
        .addSetToExercise('node-1', 10, 8, 50)
        .build();

      expect(session.id).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.date).toEqual(date);
      expect(session.routineId).toBe(routineId);
      expect(session.isCompleted()).toBe(true);
      expect(session.getComponents().length).toBe(1);
    });

    it('should throw an error if no exercises are added', () => {
      expect(() => {
        new TrainingSessionBuilder(userId).build();
      }).toThrow('Uma sessão de treino deve ter pelo menos um exercício.');
    });

    it('should throw an error if adding a set to a non-existent exercise nodeId', () => {
      expect(() => {
        new TrainingSessionBuilder(userId).addSetToExercise(
          'invalid-node',
          10,
          10,
          50,
        );
      }).toThrow('Exercicio com ID invalid-node não encontrado no buider.');
    });
  });

  describe('Composite Pattern - WorkoutComponent, ExerciseNode, TrainingSet', () => {
    it('should calculate volume and reps for TrainingSet (Leaf)', () => {
      const set1 = new TrainingSet('set-1', 10, 10, 50, 'Good set');
      const set2 = new TrainingSet('set-2', 10, 8, 0, 'Bodyweight set');
      const set3 = new TrainingSet('set-3', 10, null, null, 'Not done set');

      expect(set1.getVolume()).toBe(500); // 10 reps * 50 weight
      expect(set1.getTotalReps()).toBe(10);

      expect(set2.getVolume()).toBe(8); // Bodyweight, fallback to reps
      expect(set2.getTotalReps()).toBe(8);

      expect(set3.getVolume()).toBe(0); // null actualReps
      expect(set3.getTotalReps()).toBe(0);
    });

    it('should calculate aggregated volume and reps for ExerciseNode (Composite)', () => {
      const node = new ExerciseNode('node-1', exerciseId, 3);
      const set1 = new TrainingSet('set-1', 10, 10, 50);
      const set2 = new TrainingSet('set-2', 10, 8, 60);

      node.add(set1);
      node.add(set2);

      expect(node.getChildren().length).toBe(2);
      expect(node.getVolume()).toBe(500 + 480); // 980
      expect(node.getTotalReps()).toBe(18);

      // Verify remove
      node.remove(set2);
      expect(node.getChildren().length).toBe(1);
      expect(node.getVolume()).toBe(500);
    });

    it('should calculate total session volume via Composite traversal', () => {
      const session = new TrainingSessionBuilder(userId)
        .addExercise('ex-1', 2, 'node-1')
        .addSetToExercise('node-1', 10, 10, 50) // Vol: 500
        .addExercise('ex-2', 1, 'node-2')
        .addSetToExercise('node-2', 12, 10, 40) // Vol: 400
        .build();

      expect(session.getSessionTotalVolume()).toBe(900);
    });
  });

  describe('Iterator Pattern - TrainingSetIterator', () => {
    it('should iterate and flatten all training sets in order', () => {
      const session = new TrainingSessionBuilder(userId)
        .addExercise('ex-1', 2, 'node-1')
        .addSetToExercise('node-1', 10, 10, 50)
        .addSetToExercise('node-1', 10, 8, 55)
        .addExercise('ex-2', 1, 'node-2')
        .addSetToExercise('node-2', 12, 10, 40)
        .build();

      const iterator = session.createSetIterator();
      const resultSets: TrainingSet[] = [];

      while (iterator.hasNext()) {
        resultSets.push(iterator.next());
      }

      expect(resultSets.length).toBe(3);
      expect(resultSets[0].weight).toBe(50);
      expect(resultSets[1].weight).toBe(55);
      expect(resultSets[2].weight).toBe(40);
    });

    it('should throw an error if next is called with no more elements', () => {
      const iterator = new TrainingSetIterator([]);
      expect(iterator.hasNext()).toBe(false);
      expect(() => {
        iterator.next();
      }).toThrow('No more elements in iterator.');
    });
  });
});
