package com.edulytix.config;

import com.edulytix.entity.*;
import com.edulytix.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private RiskAlertRepository riskAlertRepository;

    @Autowired
    private LibraryRepository libraryRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            initCoreData();
        }
        if (quizRepository.count() == 0) {
            initSampleQuizzes();
        }
    }

    private void initCoreData() {

        // 1. Create Admin
        User adminUser = new User("admin", "admin123", "ADMIN", "System Administrator", "admin@edulytix.edu");
        userRepository.save(adminUser);

        // 2. Create Teachers
        User teacherUser1 = new User("prof_sharma", "teacher123", "TEACHER", "Dr. Rajesh Sharma", "sharma@edulytix.edu");
        userRepository.save(teacherUser1);
        Teacher teacher1 = new Teacher(teacherUser1, "TCH101", "Dr. Rajesh Sharma", "sharma@edulytix.edu", "Computer Science", "Professor & HOD", "9876543210");
        teacher1 = teacherRepository.save(teacher1);

        User teacherUser2 = new User("prof_anita", "teacher123", "TEACHER", "Prof. Anita Verma", "anita@edulytix.edu");
        userRepository.save(teacherUser2);
        Teacher teacher2 = new Teacher(teacherUser2, "TCH102", "Prof. Anita Verma", "anita@edulytix.edu", "Data Science", "Assistant Professor", "9876543211");
        teacher2 = teacherRepository.save(teacher2);

        // 3. Create Courses
        Course course1 = new Course("CS301", "Data Structures & Algorithms", "Computer Science", "Semester 5", teacher1);
        course1 = courseRepository.save(course1);

        Course course2 = new Course("CS302", "Database Management Systems", "Computer Science", "Semester 5", teacher2);
        course2 = courseRepository.save(course2);

        Course course3 = new Course("CS303", "Web Application Development", "Computer Science", "Semester 5", teacher1);
        course3 = courseRepository.save(course3);

        // 4. Create Students
        User userPriya = new User("student_priya", "student123", "STUDENT", "Priya Sharma", "priya.s@edulytix.edu");
        userRepository.save(userPriya);
        Student studentPriya = new Student(userPriya, "2024CS101", "Priya Sharma", "priya.s@edulytix.edu", "Computer Science", "Semester 5", "9123456780", LocalDate.now().minusMonths(6));
        studentPriya = studentRepository.save(studentPriya);

        User userAarav = new User("student_aarav", "student123", "STUDENT", "Aarav Patel", "aarav.p@edulytix.edu");
        userRepository.save(userAarav);
        Student studentAarav = new Student(userAarav, "2024CS102", "Aarav Patel", "aarav.p@edulytix.edu", "Computer Science", "Semester 5", "9123456781", LocalDate.now().minusMonths(6));
        studentAarav = studentRepository.save(studentAarav);

        User userRohan = new User("student_rohan", "student123", "STUDENT", "Rohan Mehta", "rohan.m@edulytix.edu");
        userRepository.save(userRohan);
        Student studentRohan = new Student(userRohan, "2024CS103", "Rohan Mehta", "rohan.m@edulytix.edu", "Computer Science", "Semester 5", "9123456782", LocalDate.now().minusMonths(6));
        studentRohan = studentRepository.save(studentRohan);

        User userSneha = new User("student_sneha", "student123", "STUDENT", "Sneha Reddy", "sneha.r@edulytix.edu");
        userRepository.save(userSneha);
        Student studentSneha = new Student(userSneha, "2024CS104", "Sneha Reddy", "sneha.r@edulytix.edu", "Computer Science", "Semester 5", "9123456783", LocalDate.now().minusMonths(6));
        studentSneha = studentRepository.save(studentSneha);

        // 5. Create Quiz Results
        // Priya Sharma (Has a 35% drop between Week 2 and Week 3 -> triggers Risk Alert!)
        quizResultRepository.save(new QuizResult(studentPriya, course1, 1, 17.0, 20.0, 85.0, "Great understanding of arrays and linked lists", LocalDate.now().minusDays(21)));
        quizResultRepository.save(new QuizResult(studentPriya, course1, 2, 18.0, 20.0, 90.0, "Excellent grasp on recursion and trees", LocalDate.now().minusDays(14)));
        quizResultRepository.save(new QuizResult(studentPriya, course1, 3, 11.0, 20.0, 55.0, "Struggled with Graph algorithms and DP", LocalDate.now().minusDays(7)));

        // Risk Alert for Priya
        RiskAlert alertPriya = new RiskAlert(
                studentPriya,
                course1,
                90.0,
                55.0,
                35.0,
                "CRITICAL",
                "Performance Risk Alert: Student's score dropped by 35.0% in Data Structures & Algorithms (CS301). Week 2 score: 90.0%, Week 3 score: 55.0%. Immediate academic support recommended."
        );
        riskAlertRepository.save(alertPriya);

        // Rohan Mehta (Has a 25% drop between Week 1 and Week 2 in CS302)
        quizResultRepository.save(new QuizResult(studentRohan, course2, 1, 18.0, 20.0, 90.0, "Strong knowledge of SQL schemas", LocalDate.now().minusDays(14)));
        quizResultRepository.save(new QuizResult(studentRohan, course2, 2, 13.0, 20.0, 65.0, "Difficulties with normalization and B-Trees", LocalDate.now().minusDays(7)));

        RiskAlert alertRohan = new RiskAlert(
                studentRohan,
                course2,
                90.0,
                65.0,
                25.0,
                "HIGH",
                "Performance Risk Alert: Student's score dropped by 25.0% in Database Management Systems (CS302). Week 1 score: 90.0%, Week 2 score: 65.0%. Student requires guidance on normalization."
        );
        riskAlertRepository.save(alertRohan);

        // Aarav Patel (Consistent High Performer)
        quizResultRepository.save(new QuizResult(studentAarav, course1, 1, 18.0, 20.0, 90.0, "Superb foundation", LocalDate.now().minusDays(21)));
        quizResultRepository.save(new QuizResult(studentAarav, course1, 2, 17.0, 20.0, 85.0, "Consistent score", LocalDate.now().minusDays(14)));
        quizResultRepository.save(new QuizResult(studentAarav, course1, 3, 19.0, 20.0, 95.0, "Top scorer in class", LocalDate.now().minusDays(7)));

        // Sneha Reddy (Steady Progress)
        quizResultRepository.save(new QuizResult(studentSneha, course1, 1, 13.0, 20.0, 65.0, "Needs more practice", LocalDate.now().minusDays(21)));
        quizResultRepository.save(new QuizResult(studentSneha, course1, 2, 15.0, 20.0, 75.0, "Notable improvement", LocalDate.now().minusDays(14)));
        quizResultRepository.save(new QuizResult(studentSneha, course1, 3, 17.0, 20.0, 85.0, "Solid mastery gained", LocalDate.now().minusDays(7)));

        // 6. Create Digital Library Resources
        libraryRepository.save(new LibraryResource(
                "Introduction to Algorithms (CLRS 4th Ed.)",
                "Thomas H. Cormen, Charles E. Leiserson",
                "Book",
                "Data Structures & Algorithms",
                "PDF",
                "https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/",
                "Comprehensive reference textbook for algorithm analysis, sorting, graph algorithms, and dynamic programming.",
                "Dr. Rajesh Sharma"
        ));

        libraryRepository.save(new LibraryResource(
                "Database System Concepts (7th Edition)",
                "Silberschatz, Korth, Sudarshan",
                "Book",
                "Database Management Systems",
                "PDF",
                "https://www.db-book.com/",
                "Fundamental concepts of database design, relational algebra, SQL, transactions, concurrency, and indexing.",
                "Prof. Anita Verma"
        ));

        libraryRepository.save(new LibraryResource(
                "DSA Quick Revision Notes & Problem Patterns",
                "Dr. Rajesh Sharma",
                "Notes",
                "Data Structures & Algorithms",
                "PDF",
                "https://github.com/trekhleb/javascript-algorithms",
                "Concise high-yield revision notes covering trees, two-pointer techniques, sliding windows, and graphs.",
                "Dr. Rajesh Sharma"
        ));

        libraryRepository.save(new LibraryResource(
                "SQL Query Optimization & Normalization Guide",
                "Prof. Anita Verma",
                "Notes",
                "Database Management Systems",
                "PDF",
                "https://use-the-index-luke.com/",
                "Practical guide for query tuning, indexing strategies, 1NF to BCNF normal forms with worked examples.",
                "Prof. Anita Verma"
        ));

        libraryRepository.save(new LibraryResource(
                "Modern Full-Stack Web Development Handbook",
                "Dr. Rajesh Sharma",
                "Study Material",
                "Web Application Development",
                "PDF",
                "https://developer.mozilla.org/en-US/docs/Learn",
                "Complete lecture notes covering React, RESTful API architecture, Spring Boot backend integration, and state management.",
                "Dr. Rajesh Sharma"
        ));

        libraryRepository.save(new LibraryResource(
                "Operating System Principles & Virtual Memory Guide",
                "Silberschatz & Galvin",
                "Book",
                "Operating Systems",
                "PDF",
                "https://pages.cs.wisc.edu/~remzi/OSTEP/",
                "In-depth guide covering process scheduling, deadlock mitigation, paging, and virtual memory virtualization.",
                "System Admin"
        ));
    }

    private void initSampleQuizzes() {
        Course course1 = courseRepository.findByCourseCode("CS301").orElse(null);
        Course course2 = courseRepository.findByCourseCode("CS302").orElse(null);

        Teacher teacher1 = teacherRepository.findByTeacherCode("TCH101").orElse(null);
        Teacher teacher2 = teacherRepository.findByTeacherCode("TCH102").orElse(null);

        if (course1 != null && teacher1 != null) {
            Quiz quiz1 = new Quiz(
                    "Week 1: Arrays, Strings & Complexity",
                    "Assessment of fundamental data structures, memory allocation, asymptotic analysis, and two-pointer traversal.",
                    course1,
                    teacher1,
                    1,
                    20,
                    10,
                    "PUBLISHED"
            );
            quiz1 = quizRepository.save(quiz1);

            questionRepository.save(new Question(
                    quiz1,
                    "What is the worst-case time complexity of searching an element in an unsorted array of size N?",
                    "MCQ",
                    "O(1)",
                    "O(log N)",
                    "O(N)",
                    "O(N log N)",
                    "C",
                    2,
                    "In an unsorted array, linear search must inspect every element in the worst case, leading to O(N).",
                    1
            ));

            questionRepository.save(new Question(
                    quiz1,
                    "Which data structure operates strictly on the LIFO (Last In First Out) principle?",
                    "MCQ",
                    "Queue",
                    "Stack",
                    "Binary Search Tree",
                    "Doubly Linked List",
                    "B",
                    2,
                    "Stack operations (push/pop) follow the Last In First Out discipline.",
                    2
            ));

            questionRepository.save(new Question(
                    quiz1,
                    "In a singly linked list, inserting a new node at the head position takes O(1) constant time.",
                    "TRUE_FALSE",
                    "True",
                    "False",
                    null,
                    null,
                    "A",
                    2,
                    "Updating the head pointer and next reference is an immediate constant time O(1) operation.",
                    3
            ));

            questionRepository.save(new Question(
                    quiz1,
                    "What is the auxiliary space complexity of an in-place array reversal algorithm?",
                    "MCQ",
                    "O(N)",
                    "O(1)",
                    "O(log N)",
                    "O(N^2)",
                    "B",
                    2,
                    "In-place reversal only requires a constant number of auxiliary pointer variables, taking O(1) space.",
                    4
            ));

            questionRepository.save(new Question(
                    quiz1,
                    "Which of the following sorting algorithms guarantees O(N log N) time complexity in the worst case?",
                    "MCQ",
                    "Bubble Sort",
                    "Merge Sort",
                    "Quick Sort",
                    "Insertion Sort",
                    "B",
                    2,
                    "Merge Sort always divides the problem in half and merges in linear time, guaranteeing O(N log N) worst-case time.",
                    5
            ));
        }

        if (course2 != null && teacher2 != null) {
            Quiz quiz2 = new Quiz(
                    "Week 2: SQL Fundamentals & Relational Algebra",
                    "Covers SQL queries, join conditions, relational normal forms, and transaction ACID properties.",
                    course2,
                    teacher2,
                    2,
                    15,
                    10,
                    "PUBLISHED"
            );
            quiz2 = quizRepository.save(quiz2);

            questionRepository.save(new Question(
                    quiz2,
                    "Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or AVG()?",
                    "MCQ",
                    "WHERE",
                    "HAVING",
                    "ORDER BY",
                    "GROUP BY",
                    "B",
                    2,
                    "The HAVING clause filters groups created by the GROUP BY clause based on aggregate calculations.",
                    1
            ));

            questionRepository.save(new Question(
                    quiz2,
                    "Which normal form eliminates partial dependency of non-prime attributes on a composite candidate key?",
                    "MCQ",
                    "1NF",
                    "2NF",
                    "3NF",
                    "BCNF",
                    "B",
                    2,
                    "Second Normal Form (2NF) enforces that no non-prime attribute is partially dependent on any candidate key.",
                    2
            ));

            questionRepository.save(new Question(
                    quiz2,
                    "An INNER JOIN returns every record from both tables even if no matching key is found in the right table.",
                    "TRUE_FALSE",
                    "True",
                    "False",
                    null,
                    null,
                    "B",
                    2,
                    "INNER JOIN only returns rows with matching keys in both tables; FULL OUTER JOIN returns unmatched records.",
                    3
            ));

            questionRepository.save(new Question(
                    quiz2,
                    "Which SQL command removes all records from a table without generating individual undo logs for each row?",
                    "MCQ",
                    "DELETE",
                    "DROP",
                    "TRUNCATE",
                    "ALTER",
                    "C",
                    2,
                    "TRUNCATE quickly deallocates data pages and resets auto-increment values without row-by-row logging.",
                    4
            ));

            questionRepository.save(new Question(
                    quiz2,
                    "Which ACID property ensures that committed transactions persist even during an unexpected server crash?",
                    "MCQ",
                    "Atomicity",
                    "Consistency",
                    "Isolation",
                    "Durability",
                    "D",
                    2,
                    "Durability guarantees that once a transaction commits, its effects will survive any subsequent system or hardware failure.",
                    5
            ));
        }
    }
}
