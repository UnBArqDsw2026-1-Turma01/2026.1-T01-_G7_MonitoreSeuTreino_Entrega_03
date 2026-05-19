export class Timestamp {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = new Date(value);
  }

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static from(date: Date): Timestamp {
    return new Timestamp(date);
  }

  isBefore(other: Timestamp): boolean {
    return this.value < other.value;
  }

  isAfter(other: Timestamp): boolean {
    return this.value > other.value;
  }

  toDate(): Date {
    return new Date(this.value);
  }
}
