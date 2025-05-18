export class SetUtils {
  static getDifference<T>(set1: Set<T>, set2: Set<T>) {
    return new Set([...set1].filter((element) => !set2.has(element)));
  }

  static difference<T>(set1: Set<T>, set2: Set<T>) {
    return new Set([
      ...SetUtils.getDifference(set1, set2),
      ...SetUtils.getDifference(set2, set1),
    ]);
  }

  static setsIntersection<T>(set1: Set<T>, set2: Set<T>) {
    const intersection = new Set(
      [...set1].filter((element) => set2.has(element)),
    );
    return intersection;
  }
}
