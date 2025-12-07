// use std::thread;
// use std::time::Duration;
// use std::io;

pub enum Color {
    White = 0,
    Black = 1,
}

pub enum Pieces {
    None = 0,
    Pawn = 1,
    Knight = 2,
    Bishop = 3,
    Rook = 4,
    Queen = 5,
    King = 6,
}

type Bitboard = u64;

pub struct Board {
    turn: Color,
    cont50: u8,
    enpassant: i8,
    castlingrights: u8,
    bbp: [[Bitboard; 6]; 2],
}

impl Board {
    pub fn new() -> Self {
        Self {
            turn: Color::White,
            cont50: 0,
            enpassant: -1,
            castlingrights: 0,
            bbp: [[0u64; 6]; 2],
        }
    }
}

fn printbitboards() {
    use Color::*;
    use Pieces::*;

    let mut bboard = Board {
        turn: White,
        cont50: 0,
        enpassant: -1,
        castlingrights: 0,
        bbp: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
    };

    let mut bboard2 = Board::new();

    bboard2.bbp[0][1] = 938383u64;

    let n = bboard2.bbp[0][1];
    let mut m = n;
    m = m << 32;

    println!("Max {}", u64::MAX);
    println!("Numero de bits {}", n.count_ones());
    println!("Numero de ceros {}", n.count_zeros());
    println!("leading_zeros {}", n.leading_zeros());
    println!("trailing_zeros {}", n.trailing_zeros());
    println!("En Binario n {:#064b}", n);
    println!("En Binario m {:#064b}", m);
    println!("swap_bytes {:#064b}", m.swap_bytes());
    println!("reverse_bits {:#064b}", m.reverse_bits());
}

fn main() {
    printbitboards();
}
